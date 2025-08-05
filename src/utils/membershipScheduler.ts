import cron from "node-cron";
import { Client, EmbedBuilder } from "discord.js";
import { isSupabaseAvailable, getSupabaseClient } from "../lib/supabaseClient.js";
import config from "../config/config.js";
import logger from "./logger.js";
import { getTodayInDDMMYY, parseDDMMYY } from "./dateUtils.js";
import { getBotConfig } from "./botConfig.js";

/**
 * Schedules daily membership expiration checks at 9:00 AM and Friday cleanup at 9:00 AM.
 * Sends DM notifications to users whose membership expires that day.
 * Removes roles and database entries for expired members on Fridays.
 */
export class MembershipScheduler {
    private client: Client;
    private isRunning = false;

    constructor(client: Client) {
        this.client = client;
    }

    /**
     * Starts the schedulers:
     * - Daily at 9:00 AM: Check for expiring memberships and send notifications
     * - Fridays at 9:00 AM: Remove roles and database entries for expired members
     */
    public start(): void {
        if (this.isRunning) {
            logger("[MembershipScheduler] Already running", "warn");
            return;
        }

        // Schedule for 9:00 AM every day (0 9 * * *) - notifications
        cron.schedule("0 9 * * *", async () => {
            await this.checkExpiringMemberships();
        }, {
            timezone: "Australia/Melbourne"
        });

        // Schedule for 9:00 AM every Friday (0 9 * * 5) - cleanup
        cron.schedule("0 9 * * 5", async () => {
            await this.cleanupExpiredMemberships();
        }, {
            timezone: "Australia/Melbourne"
        });

        this.isRunning = true;
        logger("[MembershipScheduler] Started - daily expiration checks and Friday cleanup at 9:00 AM", "info");
    }

    /**
     * Stops the scheduler.
     */
    public stop(): void {
        this.isRunning = false;
        logger("[MembershipScheduler] Stopped", "info");
    }

    /**
     * Checks for users whose membership expires today and sends them DM notifications.
     */
    private async checkExpiringMemberships(): Promise<void> {
        try {
            logger("[MembershipScheduler] Checking for expiring memberships...", "info");

            if (!isSupabaseAvailable()) {
                logger("[MembershipScheduler] Supabase not available, skipping check", "warn");
                return;
            }

            const supabase = getSupabaseClient();
            if (!supabase) {
                logger("[MembershipScheduler] Supabase client unavailable, skipping check", "warn");
                return;
            }

            // Get today's date in DD/MM/YY format to match database format
            const today = getTodayInDDMMYY();
            const serverTime = new Date().toLocaleString("en-SG", { timeZone: "Asia/Singapore" });
            const melbourneTime = new Date().toLocaleString("en-AU", { timeZone: "Australia/Melbourne" });
            
            logger(`[MembershipScheduler] Server time (Singapore): ${serverTime}`, "info");
            logger(`[MembershipScheduler] Melbourne time: ${melbourneTime}`, "info");
            logger(`[MembershipScheduler] Checking for memberships expiring on: ${today}`, "info");

            // Query verified_members for users whose membership expires today
            // Use RPC function to get discord_id as text to prevent precision loss
            const { data: expiringMembers, error } = await supabase
                .rpc('get_expiring_members', { expire_date: today });

            if (error) {
                logger("[MembershipScheduler] Database error: " + String(error), "error");
                return;
            }

            if (!expiringMembers || expiringMembers.length === 0) {
                logger("[MembershipScheduler] No expiring memberships found for today", "info");
                return;
            }

            logger(`[MembershipScheduler] Found ${expiringMembers.length} expiring membership(s)`, "info");

            // Send DM notifications to each expiring member
            for (const member of expiringMembers) {
                await this.sendExpirationNotification(String(member.discord_id), member.discord_username, member.full_name);
            }

        } catch (error) {
            logger("[MembershipScheduler] Error checking expiring memberships: " + String(error), "error");
        }
    }

    /**
     * Sends a DM notification to a user about their expiring membership.
     */
    private async sendExpirationNotification(discordId: string, username: string, fullName: string): Promise<void> {
        try {
            const user = await this.client.users.fetch(discordId);
            const botConfig = await getBotConfig();
            
            // Replace placeholders in the message
            const description = botConfig.commandOutputs.verify.membershipExpirationNotice.description
                .replace('{fullName}', fullName)
                .replace('{club}', botConfig.organizationName);
            
            const embed = new EmbedBuilder()
                .setTitle(botConfig.commandOutputs.verify.membershipExpirationNotice.title)
                .setDescription(description)
                .setColor(0xff9500) // Orange color for warning
                .setFooter({ 
                    text: botConfig.commandOutputs.verify.membershipExpirationNotice.footer,
                    iconURL: this.client.user?.displayAvatarURL() 
                })
                .setTimestamp();

            await user.send({ embeds: [embed] });
            logger(`[MembershipScheduler] Sent expiration notification to ${username}`, "info");

        } catch (error) {
            logger(`[MembershipScheduler] Failed to send DM to ${username}: ${String(error)}`, "error");
        }
    }

    /**
     * Removes roles and database entries for users whose membership has expired.
     * Runs on Fridays to clean up memberships that expired earlier in the week.
     */
    private async cleanupExpiredMemberships(): Promise<void> {
        try {
            logger("[MembershipScheduler] Starting Friday cleanup - removing expired memberships...", "info");

            if (!isSupabaseAvailable()) {
                logger("[MembershipScheduler] Supabase not available, skipping cleanup", "warn");
                return;
            }

            const supabase = getSupabaseClient();
            if (!supabase) {
                logger("[MembershipScheduler] Supabase client unavailable, skipping cleanup", "warn");
                return;
            }

            const { MEMBER_ROLE_ID, GUILD_ID } = config;

            logger(`[MembershipScheduler] Config - GUILD_ID: "${GUILD_ID}", MEMBER_ROLE_ID: "${MEMBER_ROLE_ID}"`, "info");

            // Get guild and role objects
            const guild = this.client.guilds.cache.get(GUILD_ID);
            if (!guild) {
                logger("[MembershipScheduler] Guild not found, cannot remove roles", "error");
                return;
            }

            logger(`[MembershipScheduler] Guild found: "${guild.name}" (ID: ${guild.id})`, "info");

            // Try to fetch the role from cache first, then from API
            let role = guild.roles.cache.get(MEMBER_ROLE_ID);
            
            if (!role) {
                logger(`[MembershipScheduler] Role not in cache, attempting to fetch from API...`, "info");
                try {
                    const fetchedRole = await guild.roles.fetch(MEMBER_ROLE_ID);
                    role = fetchedRole || undefined;
                } catch (fetchError) {
                    logger(`[MembershipScheduler] Failed to fetch role from API: ${String(fetchError)}`, "error");
                }
            }

            if (!role) {
                // Log all available roles to help debug
                const availableRoles = guild.roles.cache.map(r => `"${r.name}" (${r.id})`).join(', ');
                logger(`[MembershipScheduler] Member role not found. Available roles: ${availableRoles}`, "error");
                return;
            }

            logger(`[MembershipScheduler] Role found: "${role.name}" (ID: ${role.id})`, "info");

            // Get today's date for comparison
            const today = getTodayInDDMMYY();
            const todayDate = parseDDMMYY(today);
            
            if (!todayDate) {
                logger("[MembershipScheduler] Invalid today's date, skipping cleanup", "error");
                return;
            }

            logger(`[MembershipScheduler] Checking for memberships expired before: ${today}`, "info");

            // Get all verified members to check expiration dates
            const { data: allMembers, error } = await supabase
                .from('verified_members')
                .select('discord_id, discord_username, full_name, end_date');

            if (error) {
                logger("[MembershipScheduler] Database error during cleanup: " + String(error), "error");
                return;
            }

            if (!allMembers || allMembers.length === 0) {
                logger("[MembershipScheduler] No verified members found", "info");
                return;
            }

            const expiredMembers = [];

            // Filter members whose end_date is before today
            for (const member of allMembers) {
                if (!member.end_date) continue;
                
                const memberEndDate = parseDDMMYY(member.end_date);
                if (!memberEndDate) continue;

                // Check if membership expired (end_date < today)
                if (memberEndDate < todayDate) {
                    expiredMembers.push(member);
                }
            }

            if (expiredMembers.length === 0) {
                logger("[MembershipScheduler] No expired memberships found to clean up", "info");
                return;
            }

            logger(`[MembershipScheduler] Found ${expiredMembers.length} expired membership(s) to clean up`, "info");

            let successCount = 0;
            let errorCount = 0;

            // Process each expired member
            for (const member of expiredMembers) {
                try {
                    const discordId = String(member.discord_id);
                    
                    // Try to fetch and remove role from Discord member
                    try {
                        const guildMember = await guild.members.fetch(discordId);
                        if (guildMember && guildMember.roles.cache.has(MEMBER_ROLE_ID)) {
                            await guildMember.roles.remove(role);
                            logger(`[MembershipScheduler] Removed role from ${member.discord_username}`, "info");
                        }
                    } catch (discordError) {
                        // Member might have left the server, continue with database cleanup
                        logger(`[MembershipScheduler] Could not remove role from ${member.discord_username} (member may have left): ${String(discordError)}`, "warn");
                    }

                    // Remove from database
                    const { error: deleteError } = await supabase
                        .from('verified_members')
                        .delete()
                        .eq('discord_id', discordId);

                    if (deleteError) {
                        logger(`[MembershipScheduler] Failed to remove ${member.discord_username} from database: ${String(deleteError)}`, "error");
                        errorCount++;
                    } else {
                        logger(`[MembershipScheduler] Removed ${member.discord_username} from verified members database`, "info");
                        successCount++;
                    }

                } catch (memberError) {
                    logger(`[MembershipScheduler] Error processing expired member ${member.discord_username}: ${String(memberError)}`, "error");
                    errorCount++;
                }
            }

            logger(`[MembershipScheduler] Friday cleanup completed - ${successCount} removed, ${errorCount} errors`, "info");

        } catch (error) {
            logger("[MembershipScheduler] Error during Friday cleanup: " + String(error), "error");
        }
    }

    /**
     * Manual trigger for testing purposes.
     * Checks for expiring memberships immediately.
     */
    public async triggerCheck(): Promise<void> {
        logger("[MembershipScheduler] Manual trigger - checking expiring memberships", "info");
        await this.checkExpiringMemberships();
    }

    /**
     * Manual trigger for testing purposes.
     * Runs the Friday cleanup immediately.
     */
    public async triggerCleanup(): Promise<void> {
        logger("[MembershipScheduler] Manual trigger - running Friday cleanup", "info");
        await this.cleanupExpiredMemberships();
    }
}

export default MembershipScheduler;