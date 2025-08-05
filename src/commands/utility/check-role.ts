import type { SlashCommandProps, CommandData } from "commandkit";
import { PermissionFlagsBits, EmbedBuilder } from "discord.js";
import config from "../../config/config.js";
import logger from "../../utils/logger.js";

export const data: CommandData = {
    name: "check-role",
    description: "[ADMIN] Debug role visibility and bot permissions",
    default_member_permissions: PermissionFlagsBits.Administrator.toString(),
};

export async function run({ interaction, client }: SlashCommandProps): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    
    const username = interaction.user.username;
    const { MEMBER_ROLE_ID, GUILD_ID } = config;

    try {
        logger(`[/check-role] Debugging role access for MEMBER_ROLE_ID: ${MEMBER_ROLE_ID}`, "info", username);

        const guild = client.guilds.cache.get(GUILD_ID);
        if (!guild) {
            await interaction.editReply({ content: "❌ Guild not found" });
            return;
        }

        logger(`[/check-role] Guild: "${guild.name}" (${guild.id})`, "info", username);

        // Check bot's permissions
        const botMember = await guild.members.fetch(client.user.id);
        const botPermissions = botMember.permissions;
        
        logger(`[/check-role] Bot permissions - ManageRoles: ${botPermissions.has('ManageRoles')}, ViewChannel: ${botPermissions.has('ViewChannel')}, Administrator: ${botPermissions.has('Administrator')}`, "info", username);

        // Try multiple ways to get the role
        const results = [];

        // 1. Cache lookup
        const cachedRole = guild.roles.cache.get(MEMBER_ROLE_ID);
        if (cachedRole) {
            results.push(`✅ **Cache**: Found "${cachedRole.name}" (${cachedRole.id})`);
            logger(`[/check-role] Cache lookup successful: "${cachedRole.name}"`, "info", username);
        } else {
            results.push(`❌ **Cache**: Role not found in cache`);
            logger(`[/check-role] Cache lookup failed`, "info", username);
        }

        // 2. Direct API fetch
        try {
            const fetchedRole = await guild.roles.fetch(MEMBER_ROLE_ID);
            if (fetchedRole) {
                results.push(`✅ **API Fetch**: Found "${fetchedRole.name}" (${fetchedRole.id})`);
                logger(`[/check-role] API fetch successful: "${fetchedRole.name}"`, "info", username);
            } else {
                results.push(`❌ **API Fetch**: Returned null`);
                logger(`[/check-role] API fetch returned null`, "error", username);
            }
        } catch (fetchError) {
            results.push(`❌ **API Fetch**: Error - ${String(fetchError)}`);
            logger(`[/check-role] API fetch error: ${String(fetchError)}`, "error", username);
        }

        // 3. Full role refresh
        try {
            await guild.roles.fetch();
            const roleAfterRefresh = guild.roles.cache.get(MEMBER_ROLE_ID);
            if (roleAfterRefresh) {
                results.push(`✅ **After Refresh**: Found "${roleAfterRefresh.name}" (${roleAfterRefresh.id})`);
                logger(`[/check-role] Found after refresh: "${roleAfterRefresh.name}"`, "info", username);
            } else {
                results.push(`❌ **After Refresh**: Still not found`);
                logger(`[/check-role] Still not found after refresh`, "error", username);
            }
        } catch (refreshError) {
            results.push(`❌ **Refresh Error**: ${String(refreshError)}`);
            logger(`[/check-role] Refresh error: ${String(refreshError)}`, "error", username);
        }

        // 4. Show all roles for comparison
        const allRoles = guild.roles.cache
            .filter(role => role.id !== guild.id) // Exclude @everyone
            .sort((a, b) => b.position - a.position) // Sort by position (highest first)
            .map(role => `"${role.name}" (${role.id}) - Position: ${role.position}`)
            .join('\n');

        results.push(`\n**All Roles in Server:**\n${allRoles}`);

        // 5. Check bot's role position
        const botRole = botMember.roles.highest;
        results.push(`\n**Bot's Highest Role:** "${botRole.name}" (${botRole.id}) - Position: ${botRole.position}`);

        logger(`[/check-role] Bot's highest role: "${botRole.name}" at position ${botRole.position}`, "info", username);

        // Create response
        const embed = new EmbedBuilder()
            .setTitle("🔍 Role Debug Report")
            .setDescription(`**Target Role ID:** \`${MEMBER_ROLE_ID}\`\n\n${results.join('\n')}`)
            .setColor(0x00aeef)
            .setFooter({ text: "Role Debug Command" });

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        logger(`[/check-role] Error: ${String(error)}`, "error", username);
        await interaction.editReply({ content: `❌ Error: ${String(error)}` });
    }
} 