import { EmbedBuilder, MessageFlags, PermissionFlagsBits } from "discord.js";
import type { CommandData, SlashCommandProps } from "commandkit";
import { isSupabaseAvailable, getSupabaseClient } from "../../lib/supabaseClient.js";
import logger from "../../utils/logger.js";

/**
 * Slash command definition for fix-discord-ids.
 * @type {CommandData}
 */
export const data: CommandData = {
    name: "fix-discord-ids",
    description: "[ADMIN] Fix Discord ID precision issues in the database",
    default_member_permissions: PermissionFlagsBits.Administrator.toString(),
};

/**
 * Main handler for the /fix-discord-ids command.
 * Fixes Discord ID precision issues by ensuring they're stored as strings.
 */
export async function run({ interaction, client }: SlashCommandProps): Promise<void> {
    try {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const username = interaction.user.username;

        if (!isSupabaseAvailable()) {
            logger("[/fix-discord-ids] Supabase disabled", "error", username);
            return safeReply(interaction, createErrorEmbed("Supabase is not available"));
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
            logger("[/fix-discord-ids] Supabase client unavailable", "error", username);
            return safeReply(interaction, createErrorEmbed("Supabase client is not available"));
        }

        // Get all verified members
        const { data: members, error: fetchError } = await supabase
            .from("verified_members")
            .select("discord_id, discord_username, email");

        if (fetchError) {
            logger(`[/fix-discord-ids] Database error: ${String(fetchError)}`, "error", username);
            return safeReply(interaction, createErrorEmbed("Database error occurred"));
        }

        if (!members || members.length === 0) {
            return safeReply(interaction, createInfoEmbed("No verified members found"));
        }

        let fixedCount = 0;
        let alreadyValidCount = 0;
        let errorCount = 0;

        for (const member of members) {
            try {
                const currentId = member.discord_id;
                
                // Check if the discord_id needs fixing
                if (typeof currentId === 'number') {
                    // Try to fetch the user with the current (possibly imprecise) ID
                    let actualUserId: string | null = null;
                    
                    try {
                        await client.users.fetch(String(currentId));
                        actualUserId = String(currentId); // If it works, use it as string
                    } catch {
                        // If it fails, we need to find the correct ID
                        logger(`[/fix-discord-ids] Could not fetch user with ID ${currentId} for ${member.discord_username}`, "warn", username);
                        errorCount++;
                        continue;
                    }

                    if (actualUserId) {
                        // Update the record with the string version
                        const { error: updateError } = await supabase
                            .from("verified_members")
                            .update({ discord_id: actualUserId })
                            .eq("discord_id", currentId);

                        if (updateError) {
                            logger(`[/fix-discord-ids] Failed to update ${member.discord_username}: ${String(updateError)}`, "error", username);
                            errorCount++;
                        } else {
                            logger(`[/fix-discord-ids] Fixed ${member.discord_username}: ${currentId} -> "${actualUserId}"`, "info", username);
                            fixedCount++;
                        }
                    }
                } else if (typeof currentId === 'string') {
                    // Already a string, check if it's valid
                    try {
                        await client.users.fetch(currentId);
                        alreadyValidCount++;
                    } catch {
                        logger(`[/fix-discord-ids] Invalid string ID for ${member.discord_username}: "${currentId}"`, "warn", username);
                        errorCount++;
                    }
                } else {
                    logger(`[/fix-discord-ids] Unexpected discord_id type for ${member.discord_username}: ${typeof currentId}`, "error", username);
                    errorCount++;
                }

            } catch (error) {
                logger(`[/fix-discord-ids] Error processing ${member.discord_username}: ${String(error)}`, "error", username);
                errorCount++;
            }
        }

        logger(`[/fix-discord-ids] Completed - Fixed: ${fixedCount}, Already valid: ${alreadyValidCount}, Errors: ${errorCount}`, "info", username);
        return safeReply(interaction, createSuccessEmbed(members.length, fixedCount, alreadyValidCount, errorCount));

    } catch (error) {
        logger("[/fix-discord-ids] " + String(error), "error", interaction.user.username);
        return safeReply(interaction, createErrorEmbed("An unexpected error occurred"));
    }
}

/**
 * Error embed.
 */
function createErrorEmbed(message: string): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle("❌ Fix Discord IDs")
        .setDescription(message)
        .setColor(0xff3333)
        .setFooter({ text: "Admin Command" });
}

/**
 * Success embed.
 */
function createSuccessEmbed(total: number, fixed: number, alreadyValid: number, errors: number): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle("✅ Fix Discord IDs")
        .setDescription(
            `**Total members:** ${total}\n` +
            `**Fixed:** ${fixed}\n` +
            `**Already valid:** ${alreadyValid}\n` +
            `**Errors:** ${errors}`
        )
        .setColor(0x33cc33)
        .setFooter({ text: "Admin Command" });
}

/**
 * Info embed.
 */
function createInfoEmbed(message: string): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle("ℹ️ Fix Discord IDs")
        .setDescription(message)
        .setColor(0x00aeef)
        .setFooter({ text: "Admin Command" });
}

/**
 * Replies safely based on deferred state.
 */
const safeReply = async (interaction: any, embed: EmbedBuilder) => {
    try {
        return interaction.deferred
            ? interaction.editReply({ embeds: [embed] })
            : interaction.reply({ embeds: [embed] });
    } catch (err) {
        logger("[/fix-discord-ids] Failed to send reply: " + String(err), "error", interaction.user.username);
    }
}; 