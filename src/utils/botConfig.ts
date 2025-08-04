import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Bot configuration interface for customizable content
 */
export interface BotConfig {
    // whoami command customization
    whoamiDescription: string;
    footerText: string;
    
    // Button configurations
    joinButtonText?: string;
    joinButtonUrl?: string;
    socialsButtonText?: string;
    socialsButtonUrl?: string;
    githubButtonText?: string;
    githubButtonUrl?: string;
    
    // General bot settings
    botName: string;
    organizationName: string;
    botColor: string;
    botActivityMessage: string;
    botActivityType: string;
    
    // Verification messages
    verificationMessage: string;
    verificationFooterText: string;
    
    // Channel configuration
    memberAnnouncementsChannelId?: string;
    memberResourcesChannelId?: string;
    
    // Command descriptions (customizable)
    commandDescriptions: {
        whoami: string;
        ping: string;
        commands: string;
        eightball: string;
        cat: string;
        flip: string;
        verify: string;
        calendar: string;
    };
    
    // Command titles and messages
    commandTitles: {
        commands: string;
        commandsDescription: string;
        eightball: string;
        cat: string;
        flip: string;
        verify: string;
        calendar: string;
    };
    
    // Command output customizations
    commandOutputs: {
        commands: {
            entertainmentTitle: string;
            entertainmentCommands: string;
            utilityTitle: string;
            utilityCommands: string;
            miscTitle: string;
            miscCommands: string;
        };
        ping: {
            title: string;
            format: string;
        };
        eightball: {
            title: string;
            errorMessage: string;
        };
        cat: {
            title: string;
            errorMessage: string;
        };
        flip: {
            title: string;
            format: string;
            errorMessage: string;
        };
        verify: {
            title: string;
            errorMessage: string;
            successMessage: string;
            successDescription: string;
            alreadyVerifiedMessage: string;
            membershipExpirationNotice: {
                title: string;
                description: string;
                footer: string;
            };
            memberAnnouncementsChannel: string;
            memberResourcesChannel: string;
        };
        calendar: {
            title: string;
            noEventsMessage: string;
            errorMessage: string;
            lastUpdatedText: string;
        };
    };
}

/**
 * Default bot configuration
 */
const defaultConfig: BotConfig = {
    whoamiDescription: "A customizable Discord bot for your community.",
    footerText: "Discord Bot Generator",
    botName: "Discord Bot",
    organizationName: "Your Club",
    botColor: "#00aeef",
    botActivityMessage: "your community 👀",
    botActivityType: "Watching",
    verificationMessage: "You have been successfully verified!",
    verificationFooterText: "Thank you for being a valued member! 💗",
    memberAnnouncementsChannelId: "",
    memberResourcesChannelId: "",
    commandDescriptions: {
        whoami: "Display bot information",
        ping: "Display latency and response time",
        commands: "Display a list of all available commands",
        eightball: "Ask the magic 8-ball a question",
        cat: "Display a random cat image",
        flip: "Flip a virtual coin!",
        verify: "Verify your membership and redeem the @Member role",
        calendar: "Display a list of upcoming events"
    },
    commandTitles: {
        commands: "$ commands",
        commandsDescription: "**Commands Manual**\nBelow is a complete list of all slash commands separated by category:",
        eightball: "$ 8-ball",
        cat: "$ cat",
        flip: "$ flip",
        verify: "$ verify",
        calendar: "$ calendar"
    },
    commandOutputs: {
        commands: {
            entertainmentTitle: "/usr/bin/lol",
            entertainmentCommands: "`8ball` `cat` `flip`",
            utilityTitle: "/core/utils",
            utilityCommands: "`calendar` `ping` `verify`",
            miscTitle: "/etc/extra",
            miscCommands: "`commands` `whoami`"
        },
        ping: {
            title: "$ ping",
            format: "\\> latency :: **{latency}ms**"
        },
        eightball: {
            title: "$ 8-ball",
            errorMessage: "We're sorry — an unexpected error occurred!\n Please try again later or contact an administrator if the issue persists."
        },
        cat: {
            title: "$ cat",
            errorMessage: "We're sorry — an unexpected error occurred!\n Please try again later or contact an administrator if the issue persists."
        },
        flip: {
            title: "$ flip",
            format: "\\> output :: **{result}**",
            errorMessage: "We're sorry — an unexpected error occurred!\n Please try again later or contact an administrator if the issue persists."
        },
        verify: {
            title: "$ verify",
            errorMessage: "We're sorry — an unexpected error occurred.\n Please try again later or contact an administrator if the issue persists.",
            successMessage: "**You have been granted {roleName}!**",
            successDescription: "Explore {memberAnnouncementsChannel} and {memberResourcesChannel} for exclusive member content.",
            alreadyVerifiedMessage: "You are already a **{roleName}** — no further action needed!",
            membershipExpirationNotice: {
                title: "🔔 Membership Expiration Notice",
                description: "Hi {fullName},\n\nThis is a friendly reminder that your membership expires **today**.\n\n**As of next Friday, you will no longer have the @Member role** and will need to re-verify.\n\nTo maintain your membership benefits, please renew your membership and run the `/verify` command again next Friday evening.\n\nThank you for being a valued {club} member! 💗",
                footer: "Your Club Membership System"
            },
            memberAnnouncementsChannel: "",
            memberResourcesChannel: ""
        },
        calendar: {
            title: "$ calendar",
            noEventsMessage: "No upcoming events found matching those filters.\n Try adjusting your query or please try again later.",
            errorMessage: "We're sorry — an unexpected error occurred!\n Please try again later or contact an administrator if the issue persists.",
            lastUpdatedText: "Last Updated"
        }
    }
};

/**
 * Configuration file path
 */
const configPath = path.join(__dirname, '../../data/bot-config.json');

/**
 * Get the current bot configuration
 */
export async function getBotConfig(): Promise<BotConfig> {
    try {
        // Ensure the data directory exists
        const dataDir = path.dirname(configPath);
        await fs.mkdir(dataDir, { recursive: true });
        
        // Try to read existing config
        const configData = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(configData);
        
        // Merge with defaults to ensure all properties exist
        const mergedConfig = { ...defaultConfig, ...config };
        
        // Format channel IDs from form values if they exist
        if (mergedConfig.memberAnnouncementsChannelId) {
            mergedConfig.commandOutputs.verify.memberAnnouncementsChannel = `<#${mergedConfig.memberAnnouncementsChannelId}>`;
        }
        if (mergedConfig.memberResourcesChannelId) {
            mergedConfig.commandOutputs.verify.memberResourcesChannel = `<#${mergedConfig.memberResourcesChannelId}>`;
        }
        
        return mergedConfig;
    } catch (error) {
        // If file doesn't exist or is invalid, create with defaults
        await saveBotConfig(defaultConfig);
        return defaultConfig;
    }
}

/**
 * Save bot configuration
 */
export async function saveBotConfig(config: Partial<BotConfig>): Promise<void> {
    try {
        // Ensure the data directory exists
        const dataDir = path.dirname(configPath);
        await fs.mkdir(dataDir, { recursive: true });
        
        // Read existing config and merge
        let existingConfig: BotConfig;
        try {
            const configData = await fs.readFile(configPath, 'utf-8');
            existingConfig = JSON.parse(configData);
        } catch {
            existingConfig = defaultConfig;
        }
        
        // Merge configurations
        const newConfig = { ...existingConfig, ...config };
        
        // Save to file
        await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2));
    } catch (error) {
        console.error('Error saving bot config:', error);
        throw error;
    }
}

/**
 * Reset bot configuration to defaults
 */
export async function resetBotConfig(): Promise<void> {
    await saveBotConfig(defaultConfig);
}

/**
 * Get command description from configuration
 */
export async function getCommandDescription(commandName: string): Promise<string> {
    try {
        const config = await getBotConfig();
        return config.commandDescriptions?.[commandName as keyof typeof config.commandDescriptions] || 
               defaultConfig.commandDescriptions[commandName as keyof typeof defaultConfig.commandDescriptions] ||
               "No description available";
    } catch (error) {
        return defaultConfig.commandDescriptions[commandName as keyof typeof defaultConfig.commandDescriptions] || 
               "No description available";
    }
} 