import config from "../../config/config.js";
import { ApplicationCommandOptionType, EmbedBuilder, MessageFlags } from "discord.js";
import type { CommandData, SlashCommandProps } from "commandkit";
import { isSupabaseAvailable, getSupabaseClient } from "../../lib/supabaseClient.js";
import memberCache from "../../utils/memberCache.js";
import logger from "../../utils/logger.js";
import { getBotConfig } from "../../utils/botConfig.js";

/**
 * Slash command definition for verify.
 * @type {CommandData}
 */
export const data: CommandData = {
    name: "verify",
    description: "Verify your membership and redeem the @Member role",
    options: [
        {
            name: "email",
            description: "The email address associated with your membership",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
};

/**
 * Main handler for the /verify command.
 * Validates membership email, assigns the Member role, and logs verification.
 * @param {SlashCommandProps} props - The command properties provided by CommandKit.
 * @param {Client<true>} props.client - The Discord.js client instance.
 * @param {import("commandkit").CommandKit} props.handler - The CommandKit handler instance.
 * @param {ChatInputCommandInteraction<import("discord.js").CacheType>} props.interaction - The slash command interaction.
 * @returns {Promise<void>} Resolves after editing the deferred reply.
 */
export async function run({ interaction, client }: SlashCommandProps): Promise<void> {
    try {
        // Use an ephemeral response to keep verification private
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const { MEMBER_ROLE_ID, GUILD_ID } = config;
        const email = interaction.options.getString("email")!.trim().toLowerCase();
        const userId = interaction.user.id;
        const username = interaction.user.username;

        // Debug logging for discord_id
        logger(`[/verify] Processing verification - Discord ID: "${userId}", Username: "${username}", Email: "${email}"`, "info", username);
        logger(`[/verify] userId type: ${typeof userId}, value: "${userId}", length: ${userId.length}`, "info", username);
        logger(`[/verify] Config - GUILD_ID: "${GUILD_ID}", MEMBER_ROLE_ID: "${MEMBER_ROLE_ID}"`, "info", username);

        // — Supabase Check —
        if (!isSupabaseAvailable()) {
            throw new Error("Supabase disabled. Enable Supabase to restore functionality");
        }

        // — Guild & Role Setup —
        const guild = client.guilds.cache.get(GUILD_ID);
        if (!guild) {
            logger("[/verify] Invalid guild", "error", username);
            return safeReply(interaction, await createErrorEmbed());
        }

        logger(`[/verify] Guild found: "${guild.name}" (ID: ${guild.id})`, "info", username);

        const role = guild.roles.cache.get(MEMBER_ROLE_ID);
        if (!role) {
            // Log all available roles to help debug
            const availableRoles = guild.roles.cache.map(r => `"${r.name}" (${r.id})`).join(', ');
            logger(`[/verify] Invalid role. Available roles: ${availableRoles}`, "error", username);
            return safeReply(interaction, await createErrorEmbed());
        }

        logger(`[/verify] Role found: "${role.name}" (ID: ${role.id})`, "info", username);

        // Fetch member to inspect and modify roles
        const member = await guild.members.fetch(userId);

        // — Existing Verification Check —
        const supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error("Supabase client unavailable. Enable Supabase to restore functionality");
        }

        const { data: existing, error: fetchError } = await supabase
            .from("verified_members")
            .select("discord_id")
            .eq("discord_id", String(userId)) // Use string format for consistency
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (existing) {
            // Restore role if missing or inform user
            if (!member.roles.cache.has(MEMBER_ROLE_ID)) {
                try {
                    await member.roles.add(role);
                    logger("[/verify] Restored missing role", "success", username);
                } catch {
                    logger("[/verify] Unable to restore role", "error", username);
                    return safeReply(interaction, await createInfoEmbed(role.toString()));
                }
            }

            logger("[/verify] Already verified", "info", username);
            return safeReply(interaction, await createInfoEmbed(role.toString()));
        }

        // — Membership Validation —
        // Ensure the cache is current before checking the email list
        await memberCache.refresh();
        if (!memberCache.has(email)) {
            logger("[/verify] Invalid email", "info", username);
            return safeReply(interaction, await createErrorEmbed());
        }
        const fullName = memberCache.getFullName(email);
        if (!fullName) {
            logger("[/verify] Could not retrieve full name", "error", username);
            return safeReply(interaction, await createErrorEmbed());
        }
        const endDate = memberCache.getEndDate(email);
        if (!endDate) {
            logger("[/verify] Could not retrieve end date", "error", username);
            return safeReply(interaction, await createErrorEmbed());
        }

        // — Role Assignment & Database Upsert —
        try {
            await member.roles.add(role);
        } catch {
            logger("[/verify] Invalid permissions", "error", username);
            return safeReply(interaction, await createErrorEmbed());
        }

        // Upsert handles both insert and update to prevent duplicates
        const memberData = {
            discord_id: String(userId), // Explicitly ensure it's stored as string to prevent bigint precision loss
            email,
            full_name: fullName,
            end_date: endDate,
            discord_username: username,
            verified_at: new Date().toISOString(),
        };
        
        // Debug logging before database upsert
        logger(`[/verify] Storing member data: ${JSON.stringify(memberData)}`, "info", username);
        logger(`[/verify] discord_id being stored - type: ${typeof memberData.discord_id}, value: "${memberData.discord_id}"`, "info", username);
        
        const { error: upsertError } = await supabase.from("verified_members").upsert(memberData);

        if (upsertError) {
            // Revert role assignment on failure to keep state consistent
            await member.roles
                .remove(role)
                .catch(() => logger("[/verify] Failed to rollback role after DB error", "warn", username));
            throw upsertError;
        }

        logger("[/verify]", "success", username);
        return safeReply(interaction, await createSuccessEmbed(role.toString()));
    } catch (error) {
        logger("[/verify] " + String(error), "error", interaction.user.username);
        return safeReply(interaction, await createErrorEmbed());
    }
}

/**
 * Generic error embed.
 * @returns {Promise<EmbedBuilder>}
 */
async function createErrorEmbed(): Promise<EmbedBuilder> {
    const botConfig = await getBotConfig();
    return new EmbedBuilder()
        .setTitle(botConfig.commandOutputs.verify.title)
        .setDescription(botConfig.commandOutputs.verify.errorMessage)
        .addFields({
            name: "Known Issues",
            value: "Due to a limitation from DUSA, it may take up to one week for your details to appear in our system. We appreciate your patience!",
        })
        .setColor(0xff3333)
        .setFooter({ text: "exit status: 1" });
}

/**
 * Success embed.
 * @param {string} roleName
 * @returns {Promise<EmbedBuilder>}
 */
async function createSuccessEmbed(roleName: string): Promise<EmbedBuilder> {
    const botConfig = await getBotConfig();
    const successMessage = botConfig.commandOutputs.verify.successMessage.replace('{roleName}', roleName);
    const successDescription = botConfig.commandOutputs.verify.successDescription
        .replace('{memberAnnouncementsChannel}', botConfig.commandOutputs.verify.memberAnnouncementsChannel)
        .replace('{memberResourcesChannel}', botConfig.commandOutputs.verify.memberResourcesChannel);
    
    return new EmbedBuilder()
        .setTitle(botConfig.commandOutputs.verify.title)
        .setDescription(`${successMessage}\n ${successDescription}`)
        .setColor(0x33cc33)
        .setFooter({ text: botConfig.verificationFooterText });
}

/**
 * Informational embed.
 * @param {string} roleName
 * @returns {Promise<EmbedBuilder>}
 */
async function createInfoEmbed(roleName: string): Promise<EmbedBuilder> {
    const botConfig = await getBotConfig();
    const alreadyVerifiedMessage = botConfig.commandOutputs.verify.alreadyVerifiedMessage.replace('{roleName}', roleName);
    
    return new EmbedBuilder()
        .setTitle(botConfig.commandOutputs.verify.title)
        .setDescription(alreadyVerifiedMessage)
        .setColor(0x00aeef)
        .setFooter({ text: botConfig.verificationFooterText });
}

/**
 * Replies or edits the interaction safely based on deferred state.
 * @param {import('discord.js').Interaction} interaction
 * @param {EmbedBuilder} embed
 */
const safeReply = async (interaction: any, embed: EmbedBuilder) => {
    try {
        return interaction.deferred
            ? interaction.editReply({ embeds: [embed] })
            : interaction.reply({ embeds: [embed] });
    } catch (err) {
        logger("[/verify] Failed to send reply: " + String(err), "error", interaction.user.username);
    }
};
