import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Environment configuration interface
 */
export interface EnvConfig {
    DISCORD_TOKEN: string;
    GUILD_ID: string;
    DEV_ROLE_ID: string;
    MEMBER_ROLE_ID: string;
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
    WEB_PORT?: string;
    WEB_SECRET?: string;
}

/**
 * Environment file path
 */
const envPath = path.join(__dirname, '../../.env');

/**
 * Get current environment configuration
 */
export async function getEnvConfig(): Promise<Partial<EnvConfig>> {
    try {
        const envData = await fs.readFile(envPath, 'utf-8');
        const config: Partial<EnvConfig> = {};
        
        // Parse .env file
        const lines = envData.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                    config[key as keyof EnvConfig] = value;
                }
            }
        }
        
        return config;
    } catch (error) {
        // If .env doesn't exist, return empty config
        return {};
    }
}

/**
 * Save environment configuration
 */
export async function saveEnvConfig(config: Partial<EnvConfig>): Promise<void> {
    try {
        // Read existing config
        let existingConfig: Partial<EnvConfig> = {};
        try {
            existingConfig = await getEnvConfig();
        } catch {
            // File doesn't exist, start with empty config
        }
        
        // Merge configurations
        const newConfig = { ...existingConfig, ...config };
        
        // Convert to .env format
        const envLines: string[] = [];
        for (const [key, value] of Object.entries(newConfig)) {
            if (value !== undefined && value !== null) {
                envLines.push(`${key}=${value}`);
            }
        }
        
        // Write to .env file
        await fs.writeFile(envPath, envLines.join('\n') + '\n');
    } catch (error) {
        console.error('Error saving environment config:', error);
        throw error;
    }
}

/**
 * Validate environment configuration
 */
export function validateEnvConfig(config: Partial<EnvConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!config.DISCORD_TOKEN) {
        errors.push('DISCORD_TOKEN is required');
    }
    
    if (!config.GUILD_ID) {
        errors.push('GUILD_ID is required');
    }
    
    if (!config.DEV_ROLE_ID) {
        errors.push('DEV_ROLE_ID is required');
    }
    
    if (!config.MEMBER_ROLE_ID) {
        errors.push('MEMBER_ROLE_ID is required');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
} 