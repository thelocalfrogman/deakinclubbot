import { EmbedBuilder } from "discord.js";
import type { CommandData, SlashCommandProps } from "commandkit";
import logger from "../../utils/logger.js";
import { getBotConfig } from "../../utils/botConfig.js";

/**
 * Interface for cat API response
 */
interface CatApiResponse {
    id: string;
    url: string;
    width: number;
    height: number;
}

/**
 * Slash command definition for cat.
 * @type {CommandData}
 */
export const data: CommandData = {
    name: "cat",
    description: "Display a random cat image",
};

/**
 * Main handler for the /cat command.
 * Fetches a random cat image from a cat API and replies with an embed.
 * @param {SlashCommandProps} props - The command properties provided by CommandKit.
 * @param {Client<true>} props.client - The Discord.js client instance.
 * @param {import("commandkit").CommandKit} props.handler - The CommandKit handler instance.
 * @param {ChatInputCommandInteraction<import("discord.js").CacheType>} props.interaction - The slash command interaction.
 * @returns {Promise<void>} Resolves after editing the deferred reply.
 */
export async function run({ interaction }: SlashCommandProps): Promise<void> {
    let deferred = false;
    
    try {
        // Defer to allow time for fetching image and building embed
        await interaction.deferReply();
        deferred = true;

        // Get bot configuration
        const botConfig = await getBotConfig();

        // — Fetch a random cat image from the API —
        const response = await fetch('https://api.thecatapi.com/v1/images/search?size=full');
        
        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const catData = await response.json() as CatApiResponse[];
        
        if (!catData || !Array.isArray(catData) || catData.length === 0 || !catData[0]?.url) {
            throw new Error('Invalid response from cat API');
        }

        const catImageUrl = catData[0].url;

        // — Build embed with the cat image —
        const embed = new EmbedBuilder()
            .setTitle(botConfig.commandOutputs?.cat?.title || "$ cat")
            .setImage(catImageUrl)
            .setColor(parseInt(botConfig.botColor.replace('#', ''), 16))

        await interaction.editReply({ embeds: [embed] });
        logger("[/cat]", "success", interaction.user.username);
    } catch (error) {
        // Get bot configuration for error handling
        const botConfig = await getBotConfig();
        
        const errorEmbed = new EmbedBuilder()
            .setTitle("$ cat")
            .setDescription(
                botConfig.commandOutputs?.cat?.errorMessage || "We're sorry — an unexpected error occurred!\n Please try again later or contact an administrator if the issue persists.",
            )
            .setColor(0xff3333)
            .setFooter({ text: "exit status: 1" });

        try {
            if (deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed] });
            }
        } catch (replyError) {
            // If both editReply and reply fail, try to follow up
            try {
                await interaction.followUp({ 
                    embeds: [errorEmbed],
                    ephemeral: true 
                });
            } catch (followUpError) {
                logger("[/cat] Failed to send error message: " + String(followUpError), "error", interaction.user.username);
            }
        }
        
        logger("[/cat] " + String(error), "error", interaction.user.username);
    }
}
