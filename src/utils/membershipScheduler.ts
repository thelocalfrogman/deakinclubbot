import cron from "node-cron";
import { Client, EmbedBuilder } from "discord.js";
import { isSupabaseAvailable, getSupabaseClient } from "../lib/supabaseClient.js";
import logger from "./logger.js";
import { getTodayInDDMMYY } from "./dateUtils.js";

/**
 * Schedules daily membership expiration checks at 9:00 AM.
 * Sends DM notifications to users whose membership expires that day.
 */
export class MembershipScheduler {
    private client: Client;
    private isRunning = false;

    constructor(client: Client) {
        this.client = client;
    }

    /**
     * Starts the daily scheduler at 9:00 AM.
     */
    public start(): void {
        if (this.isRunning) {
            logger("[MembershipScheduler] Already running", "warn");
            return;
        }

        // Schedule for 9:00 AM every day (0 9 * * *)
        cron.schedule("0 9 * * *", async () => {
            await this.checkExpiringMemberships();
        }, {
            timezone: "Australia/Melbourne" // Adjust timezone as needed
        });

        this.isRunning = true;
        logger("[MembershipScheduler] Started - will check for expiring memberships daily at 9:00 AM", "info");
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
            logger(`[MembershipScheduler] Checking for memberships expiring on: ${today}`, "info");

            // Query verified_members for users whose membership expires today
            const { data: expiringMembers, error } = await supabase
                .from("verified_members")
                .select("discord_id, discord_username, full_name, end_date")
                .eq("end_date", today);

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
                // Debug logging for discord_id validation
                logger(`[MembershipScheduler] Checking member: ${member.discord_username}, discord_id: "${member.discord_id}", type: ${typeof member.discord_id}, length: ${member.discord_id?.length}`, "info");
                
                // Validate discord_id before attempting to send notification
                if (!member.discord_id) {
                    logger(`[MembershipScheduler] Invalid discord_id for ${member.discord_username}: discord_id is falsy`, "error");
                    continue;
                }
                
                if (member.discord_id === 'null') {
                    logger(`[MembershipScheduler] Invalid discord_id for ${member.discord_username}: discord_id is string "null"`, "error");
                    continue;
                }
                
                if (member.discord_id === null) {
                    logger(`[MembershipScheduler] Invalid discord_id for ${member.discord_username}: discord_id is null`, "error");
                    continue;
                }
                
                if (typeof member.discord_id !== 'string') {
                    // Try to convert to string if it's a number
                    if (typeof member.discord_id === 'number' || typeof member.discord_id === 'bigint') {
                        member.discord_id = String(member.discord_id);
                        logger(`[MembershipScheduler] Converted discord_id to string for ${member.discord_username}: "${member.discord_id}"`, "info");
                    } else {
                        logger(`[MembershipScheduler] Invalid discord_id for ${member.discord_username}: discord_id is not string, type: ${typeof member.discord_id}`, "error");
                        continue;
                    }
                }
                
                if (member.discord_id.length < 17) {
                    logger(`[MembershipScheduler] Invalid discord_id for ${member.discord_username}: discord_id too short, length: ${member.discord_id.length}`, "error");
                    continue;
                }
                
                if (member.discord_id.length > 20) {
                    logger(`[MembershipScheduler] Invalid discord_id for ${member.discord_username}: discord_id too long, length: ${member.discord_id.length}`, "error");
                    continue;
                }

                await this.sendExpirationNotification(member.discord_id, member.discord_username, member.full_name);
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
            
            const embed = new EmbedBuilder()
                .setTitle("🔔 Membership Expiration Notice")
                .setDescription(
                    `Hi ${fullName},\n\n` +
                    `This is a friendly reminder that your membership expires **today**.\n\n` +
                    `**As of next Friday, you will no longer have the @Member role** and will need to re-verify.\n\n` +
                    `To maintain your membership benefits, please renew your membership and run the \`/verify\` command again next Friday evening.\n\n` +
                    `Thank you for being a valued DUCA member! 💗`
                )
                .setColor(0xff9500) // Orange color for warning
                .setFooter({ 
                    text: "DUCA Membership System",
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
     * Manual trigger for testing purposes.
     * Checks for expiring memberships immediately.
     */
    public async triggerCheck(): Promise<void> {
        logger("[MembershipScheduler] Manual trigger - checking expiring memberships", "info");
        await this.checkExpiringMemberships();
    }
}

export default MembershipScheduler; 