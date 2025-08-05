import type { SlashCommandProps, CommandData } from "commandkit";
import { PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { isSupabaseAvailable, getSupabaseClient } from "../../lib/supabaseClient.js";
import config from "../../config/config.js";
import logger from "../../utils/logger.js";
import { getTodayInDDMMYY, parseDDMMYY } from "../../utils/dateUtils.js";

export const data: CommandData = {
    name: "cleanup-expired",
    description: "[ADMIN] Manually remove roles and database entries for expired memberships",
    default_member_permissions: PermissionFlagsBits.Administrator.toString(),
};

export async function run({ interaction, client }: SlashCommandProps): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    
    const username = interaction.user.username;

    try {
        if (!isSupabaseAvailable()) {
            logger("[/cleanup-expired] Supabase not available", "error", username);
            return safeReply(interaction, createErrorEmbed("Supabase is not available"));
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
            logger("[/cleanup-expired] Supabase client unavailable", "error", username);
            return safeReply(interaction, createErrorEmbed("Supabase client is not available"));
        }

        const { MEMBER_ROLE_ID, GUILD_ID } = config;

        // Get guild and role objects
        const guild = client.guilds.cache.get(GUILD_ID);
        if (!guild) {
            logger("[/cleanup-expired] Guild not found", "error", username);
            return safeReply(interaction, createErrorEmbed("Guild not found"));
        }

        const role = guild.roles.cache.get(MEMBER_ROLE_ID);
        if (!role) {
            logger("[/cleanup-expired] Member role not found", "error", username);
            return safeReply(interaction, createErrorEmbed("Member role not found"));
        }

        // Get today's date for comparison
        const today = getTodayInDDMMYY();
        const todayDate = parseDDMMYY(today);
        
        if (!todayDate) {
            logger("[/cleanup-expired] Invalid today's date", "error", username);
            return safeReply(interaction, createErrorEmbed("Invalid date calculation"));
        }

        const serverTime = new Date().toLocaleString("en-SG", { timeZone: "Asia/Singapore" });
        const melbourneTime = new Date().toLocaleString("en-AU", { timeZone: "Australia/Melbourne" });
        
        logger(`[/cleanup-expired] Server time (Singapore): ${serverTime}`, "info", username);
        logger(`[/cleanup-expired] Melbourne time: ${melbourneTime}`, "info", username);
        logger(`[/cleanup-expired] Checking for memberships expired before: ${today}`, "info", username);

        // Get all verified members to check expiration dates
        const { data: allMembers, error } = await supabase
            .from('verified_members')
            .select('discord_id, discord_username, full_name, end_date');

        if (error) {
            logger("[/cleanup-expired] Database error: " + String(error), "error", username);
            return safeReply(interaction, createErrorEmbed("Database error occurred"));
        }

        if (!allMembers || allMembers.length === 0) {
            logger("[/cleanup-expired] No verified members found", "info", username);
            return safeReply(interaction, createInfoEmbed("No verified members found in the database"));
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
            logger("[/cleanup-expired] No expired memberships found", "info", username);
            return safeReply(interaction, createInfoEmbed("No expired memberships found to clean up"));
        }

        logger(`[/cleanup-expired] Found ${expiredMembers.length} expired membership(s)`, "info", username);

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
                        logger(`[/cleanup-expired] Removed role from ${member.discord_username}`, "info", username);
                    }
                } catch (discordError) {
                    // Member might have left the server, continue with database cleanup
                    logger(`[/cleanup-expired] Could not remove role from ${member.discord_username} (member may have left): ${String(discordError)}`, "warn", username);
                }

                // Remove from database
                const { error: deleteError } = await supabase
                    .from('verified_members')
                    .delete()
                    .eq('discord_id', discordId);

                if (deleteError) {
                    logger(`[/cleanup-expired] Failed to remove ${member.discord_username} from database: ${String(deleteError)}`, "error", username);
                    errorCount++;
                } else {
                    logger(`[/cleanup-expired] Removed ${member.discord_username} from verified members database`, "info", username);
                    successCount++;
                }

            } catch (memberError) {
                logger(`[/cleanup-expired] Error processing expired member ${member.discord_username}: ${String(memberError)}`, "error", username);
                errorCount++;
            }
        }

        logger(`[/cleanup-expired] Cleanup completed - ${successCount} removed, ${errorCount} errors`, "info", username);

        // Create success/failure message
        let resultMessage;
        
        if (successCount > 0 && errorCount === 0) {
            resultMessage = createSuccessEmbed(`Successfully cleaned up ${successCount} expired membership(s)! 🧹\n\nRemoved roles and database entries for members whose memberships had expired.`);
        } else if (successCount > 0 && errorCount > 0) {
            resultMessage = createSuccessEmbed(`Partially completed cleanup: ${successCount} removed, ${errorCount} failed. 🧹\n\nCheck logs for details about any failures.`);
        } else if (errorCount > 0) {
            resultMessage = createErrorEmbed(`Cleanup failed for all ${errorCount} expired member(s). Check logs for details.`);
        } else {
            resultMessage = createInfoEmbed("No expired memberships found to clean up.");
        }

        await safeReply(interaction, resultMessage);

    } catch (error) {
        logger("[/cleanup-expired] " + String(error), "error", username);
        await safeReply(interaction, createErrorEmbed("An unexpected error occurred"));
    }
}

/**
 * Generic error embed.
 */
function createErrorEmbed(message: string): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle("❌ Cleanup Expired Memberships")
        .setDescription(message)
        .setColor(0xff3333)
        .setFooter({ text: "Admin Command" });
}

/**
 * Success embed.
 */
function createSuccessEmbed(message: string): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle("✅ Cleanup Expired Memberships")
        .setDescription(message)
        .setColor(0x33cc33)
        .setFooter({ text: "Admin Command" });
}

/**
 * Info embed.
 */
function createInfoEmbed(message: string): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle("ℹ️ Cleanup Expired Memberships")
        .setDescription(message)
        .setColor(0x00aeef)
        .setFooter({ text: "Admin Command" });
}

/**
 * Replies or edits the interaction safely based on deferred state.
 */
const safeReply = async (interaction: any, embed: EmbedBuilder) => {
    try {
        return interaction.deferred
            ? interaction.editReply({ embeds: [embed] })
            : interaction.reply({ embeds: [embed] });
    } catch (err) {
        logger("[/cleanup-expired] Failed to send reply: " + String(err), "error", interaction.user.username);
    }
}; 