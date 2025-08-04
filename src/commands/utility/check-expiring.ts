import { EmbedBuilder, MessageFlags, PermissionFlagsBits } from "discord.js";
import type { CommandData, SlashCommandProps } from "commandkit";
import { isSupabaseAvailable, getSupabaseClient } from "../../lib/supabaseClient.js";
import logger from "../../utils/logger.js";

/**
 * Slash command definition for check-expiring.
 * @type {CommandData}
 */
export const data: CommandData = {
    name: "check-expiring",
    description: "[ADMIN] Manually check for expiring memberships and send notifications",
    default_member_permissions: PermissionFlagsBits.Administrator.toString(),
};

/**
 * Main handler for the /check-expiring command.
 * Manually triggers the membership expiration check for testing purposes.
 */
export async function run({ interaction, client }: SlashCommandProps): Promise<void> {
    try {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const username = interaction.user.username;

        // — Supabase Check —
        if (!isSupabaseAvailable()) {
            logger("[/check-expiring] Supabase disabled", "error", username);
            return safeReply(interaction, createErrorEmbed("Supabase is not available"));
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
            logger("[/check-expiring] Supabase client unavailable", "error", username);
            return safeReply(interaction, createErrorEmbed("Supabase client is not available"));
        }

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // Query verified_members for users whose membership expires today
        const { data: expiringMembers, error } = await supabase
            .from("verified_members")
            .select("discord_id, discord_username, full_name, end_date")
            .eq("end_date", today);

        if (error) {
            logger("[/check-expiring] Database error: " + String(error), "error", username);
            return safeReply(interaction, createErrorEmbed("Database error occurred"));
        }

        if (!expiringMembers || expiringMembers.length === 0) {
            logger("[/check-expiring] No expiring memberships found", "info", username);
            return safeReply(interaction, createInfoEmbed("No memberships expire today"));
        }

        // Send DM notifications to each expiring member
        let successCount = 0;
        for (const member of expiringMembers) {
            try {
                const user = await client.users.fetch(member.discord_id);
                
                const embed = new EmbedBuilder()
                    .setTitle("🔔 Membership Expiration Notice")
                    .setDescription(
                        `Hi ${member.full_name},\n\n` +
                        `This is a friendly reminder that your membership expires **today**.\n\n` +
                        `**As of next Friday, you will no longer have the @Member role** and will need to re-verify.\n\n` +
                        `To maintain your membership benefits, please renew your membership and run the \`/verify\` command again next Friday evening.\n\n` +
                        `Thank you for being a valued DUCA member! 💗`
                    )
                    .setColor(0xff9500) // Orange color for warning
                    .setFooter({ 
                        text: "DUCA Membership System",
                        iconURL: client.user?.displayAvatarURL() 
                    })
                    .setTimestamp();

                await user.send({ embeds: [embed] });
                successCount++;
                logger(`[/check-expiring] Sent notification to ${member.discord_username}`, "info", username);

            } catch (dmError) {
                logger(`[/check-expiring] Failed to send DM to ${member.discord_username}: ${String(dmError)}`, "error", username);
            }
        }

        logger(`[/check-expiring] Processed ${expiringMembers.length} expiring memberships, ${successCount} notifications sent`, "info", username);
        return safeReply(interaction, createSuccessEmbed(expiringMembers.length, successCount));

    } catch (error) {
        logger("[/check-expiring] " + String(error), "error", interaction.user.username);
        return safeReply(interaction, createErrorEmbed("An unexpected error occurred"));
    }
}

/**
 * Generic error embed.
 */
function createErrorEmbed(message: string): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle("❌ Check Expiring Memberships")
        .setDescription(message)
        .setColor(0xff3333)
        .setFooter({ text: "Admin Command" });
}

/**
 * Success embed.
 */
function createSuccessEmbed(totalFound: number, successCount: number): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle("✅ Check Expiring Memberships")
        .setDescription(
            `**Found:** ${totalFound} expiring membership(s)\n` +
            `**Notifications sent:** ${successCount}\n` +
            `**Failed:** ${totalFound - successCount}`
        )
        .setColor(0x33cc33)
        .setFooter({ text: "Admin Command" });
}

/**
 * Info embed.
 */
function createInfoEmbed(message: string): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle("ℹ️ Check Expiring Memberships")
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
        logger("[/check-expiring] Failed to send reply: " + String(err), "error", interaction.user.username);
    }
}; 