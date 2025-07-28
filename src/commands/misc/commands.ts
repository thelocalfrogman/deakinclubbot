import { EmbedBuilder } from "discord.js";
import type { CommandData, SlashCommandProps } from "commandkit";
import logger from "../../utils/logger.js";
import { getBotConfig } from "../../utils/botConfig.js";

/**
 * Slash command definition for commands.
 * @type {CommandData}
 */
export const data: CommandData = {
    name: "commands",
    description: "Display a list of all available commands",
};

/**
 * Main handler for the /man command.
 * Builds an embed listing active commands and replies to the user.
 * @param {SlashCommandProps} props - The command properties provided by CommandKit.
 * @param {Client<true>} props.client - The Discord.js client instance.
 * @param {import("commandkit").CommandKit} props.handler - The CommandKit handler instance.
 * @param {ChatInputCommandInteraction<import("discord.js").CacheType>} props.interaction - The slash command interaction.
 * @returns {Promise<void>} Resolves after editing the deferred reply.
 */
export async function run({ interaction, client }: SlashCommandProps): Promise<void> {
    try {
        await interaction.deferReply();

        // Get bot configuration
        const botConfig = await getBotConfig();

        // — Retrieve bot avatar URL for thumbnail —
        const avatarUrl = client.user?.avatarURL() ?? undefined;

        // — Build the commands list embed —
        const embed = new EmbedBuilder()
            .setTitle(botConfig.commandTitles?.commands || "$ commands")
            .setDescription(
                botConfig.commandTitles?.commandsDescription || "**Commands Manual**\nBelow is a complete list of all slash commands separated by category:",
            )
            .addFields(
                // Entertainment
                { 
                    name: botConfig.commandOutputs?.commands?.entertainmentTitle || "/usr/bin/lol", 
                    value: botConfig.commandOutputs?.commands?.entertainmentCommands || "`8ball` `cat` `flip`" 
                },
                // Utility
                { 
                    name: botConfig.commandOutputs?.commands?.utilityTitle || "/core/utils", 
                    value: botConfig.commandOutputs?.commands?.utilityCommands || "`calendar` `ping` `verify`" 
                },
                // Misc
                { 
                    name: botConfig.commandOutputs?.commands?.miscTitle || "/etc/extra", 
                    value: botConfig.commandOutputs?.commands?.miscCommands || "`commands` `whoami`" 
                },
            )
            .setColor(parseInt(botConfig.botColor.replace('#', ''), 16))
            .setFooter({ text: botConfig.footerText || "Discord Bot Generator" });

        // Append thumbnail if available
        if (avatarUrl) {
            embed.setThumbnail(avatarUrl);
        }

        await interaction.editReply({ embeds: [embed] });
        logger("[/man]", "success", interaction.user.username);
    } catch (error) {
        // Get bot configuration for error handling
        const botConfig = await getBotConfig();
        
        const errorEmbed = new EmbedBuilder()
            .setTitle(botConfig.commandTitles?.commands || "$ commands")
            .setDescription(
                "We're sorry — an unexpected error occurred!\n Please try again later or contact an administrator if the issue persists.",
            )
            .setColor(0xff3333)
            .setFooter({ text: "exit status: 1" });

        await interaction.editReply({ embeds: [errorEmbed] });
        logger("[/commands] " + String(error), "error", interaction.user.username);
    }
}
