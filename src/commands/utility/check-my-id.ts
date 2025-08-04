import { EmbedBuilder, MessageFlags } from "discord.js";
import type { CommandData, SlashCommandProps } from "commandkit";
import { isSupabaseAvailable, getSupabaseClient } from "../../lib/supabaseClient.js";
import logger from "../../utils/logger.js";

/**
 * Slash command definition for check-my-id.
 * @type {CommandData}
 */
export const data: CommandData = {
    name: "check-my-id",
    description: "Check your actual Discord ID vs what's stored in the database",
};

/**
 * Main handler for the /check-my-id command.
 * Shows user their actual Discord ID and what's stored in the database.
 */
export async function run({ interaction }: SlashCommandProps): Promise<void> {
    try {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const actualUserId = interaction.user.id;
        const username = interaction.user.username;

        logger(`[/check-my-id] User ${username} checking IDs - Actual: ${actualUserId}`, "info", username);

        // Check what's stored in database
        let storedUserId = "Not found";
        let storedData = null;

        if (isSupabaseAvailable()) {
            const supabase = getSupabaseClient();
            if (supabase) {
                const { data, error } = await supabase
                    .from("verified_members")
                    .select("discord_id, discord_username, email, verified_at")
                    .eq("discord_id", actualUserId)
                    .maybeSingle();

                if (error) {
                    logger(`[/check-my-id] Database error: ${String(error)}`, "error", username);
                } else if (data) {
                    storedUserId = String(data.discord_id);
                    storedData = data;
                } else {
                    // Try to find by username as fallback
                    const { data: byUsername } = await supabase
                        .from("verified_members")
                        .select("discord_id, discord_username, email, verified_at")
                        .eq("discord_username", username)
                        .maybeSingle();
                    
                    if (byUsername) {
                        storedUserId = String(byUsername.discord_id);
                        storedData = byUsername;
                    }
                }
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("🔍 Discord ID Check")
            .setDescription(
                `**Your Actual Discord ID:** \`${actualUserId}\`\n` +
                `**Stored Discord ID:** \`${storedUserId}\`\n` +
                `**Match:** ${actualUserId === storedUserId ? "✅ Yes" : "❌ No"}\n\n` +
                (storedData ? 
                    `**Stored Data:**\n` +
                    `• Username: ${storedData.discord_username}\n` +
                    `• Email: ${storedData.email}\n` +
                    `• Verified: ${new Date(storedData.verified_at).toLocaleString()}`
                    : "❌ No verification record found")
            )
            .setColor(actualUserId === storedUserId ? 0x33cc33 : 0xff3333)
            .setFooter({ text: "Debug Command" });

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        logger("[/check-my-id] " + String(error), "error", interaction.user.username);
        
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Error")
            .setDescription("An error occurred while checking Discord IDs")
            .setColor(0xff3333);
            
        await interaction.editReply({ embeds: [errorEmbed] });
    }
} 