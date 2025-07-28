import { EmbedBuilder } from "discord.js";
import type { CommandData, SlashCommandProps } from "commandkit";
import logger from "../../utils/logger.js";
import { getBotConfig } from "../../utils/botConfig.js";

/**
 * Slash command definition for ping.
 * @type {CommandData}
 */
export const data: CommandData = {
    name: "ping",
    description: "Display latency and response time",
};

/**
 * Main handler for the /ping command.
 * Calculates latency and replies with an embed.
 * @param {SlashCommandProps} props - The command properties provided by CommandKit.
 * @param {Client<true>} props.client - The Discord.js client instance.
 * @param {import("commandkit").CommandKit} props.handler - The CommandKit handler instance.
 * @param {ChatInputCommandInteraction<import("discord.js").CacheType>} props.interaction - The slash command interaction.
 * @returns {Promise<void>} Resolves after editing the deferred reply.
 */
export async function run({ interaction }: SlashCommandProps): Promise<void> {
    try {
        await interaction.deferReply();

        // Get bot configuration
        const botConfig = await getBotConfig();

        const sent = await interaction.editReply({ content: "Pinging..." });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;

        const embed = new EmbedBuilder()
            .setTitle(botConfig.commandOutputs?.ping?.title || "$ ping")
            .setDescription(botConfig.commandOutputs?.ping?.format?.replace('{latency}', latency.toString()) || `\\> latency :: **${latency}ms**`)
            .setColor(parseInt(botConfig.botColor.replace('#', ''), 16))
            .setFooter({ text: botConfig.footerText || "Discord Bot Generator" });

        await interaction.editReply({ embeds: [embed] });
        logger("[/ping]", "success", interaction.user.username);
    } catch (error) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("$ ping")
            .setDescription(
                "We're sorry — an unexpected error occurred!\n Please try again later or contact an administrator if the issue persists.",
            )
            .setColor(0xff3333)
            .setFooter({ text: "exit status: 1" });

        await interaction.editReply({ embeds: [errorEmbed] });
        logger("[/ping] " + String(error), "error", interaction.user.username);
    }
}
