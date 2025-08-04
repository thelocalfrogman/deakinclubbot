import { Client, ActivityType } from "discord.js";
import { getBotConfig } from "../../utils/botConfig.js";

/**
 * Sets the bot's activity status.
 *
 * @param client - The Discord client instance
 */
export default async (client: Client): Promise<void> => {
    const botConfig = await getBotConfig();
    
    // Map string activity type to Discord ActivityType enum
    const activityTypeMap: Record<string, ActivityType> = {
        'Watching': ActivityType.Watching,
        'Playing': ActivityType.Playing,
        'Listening': ActivityType.Listening,
        'Competing': ActivityType.Competing
    };
    
    const activityType = activityTypeMap[botConfig.botActivityType] || ActivityType.Watching;
    
    client.user!.setActivity(botConfig.botActivityMessage, { type: activityType });
};
