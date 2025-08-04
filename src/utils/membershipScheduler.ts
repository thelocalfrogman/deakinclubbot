import cron from "node-cron";
import { Client, EmbedBuilder } from "discord.js";
import { isSupabaseAvailable, getSupabaseClient } from "../lib/supabaseClient.js";
import logger from "./logger.js";
import { getTodayInDDMMYY } from "./dateUtils.js";
import { getBotConfig } from "./botConfig.js";

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
     * Manual trigger for testing purposes.
     * Checks for expiring memberships immediately.
     */
    public async triggerCheck(): Promise<void> {
        logger("[MembershipScheduler] Manual trigger - checking expiring memberships", "info");
        await this.checkExpiringMemberships();
    }
}

export default MembershipScheduler;