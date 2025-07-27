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
    botColor: string;
    
    // Welcome messages
    welcomeMessage: string;
    verificationMessage: string;
}

/**
 * Default bot configuration
 */
const defaultConfig: BotConfig = {
    whoamiDescription: "A customizable Discord bot for your community.",
    footerText: "Discord Bot Generator",
    botName: "Discord Bot",
    botColor: "#00aeef",
    welcomeMessage: "Welcome to our community!",
    verificationMessage: "You have been successfully verified!"
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
        return { ...defaultConfig, ...config };
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