import "dotenv/config";

/**
 * Retrieves an environment variable and throws an error if it's not defined.
 *
 * @param {string} name - The name of the environment variable to retrieve.
 * @throws {Error} If the environment variable is missing or empty.
 * @returns {string} The value of the environment variable.
 */
function getEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

/**
 * Retrieves an optional environment variable.
 *
 * @param {string} name - The name of the environment variable to retrieve.
 * @returns {string | undefined} The value of the environment variable or undefined if not set.
 */
function getOptionalEnvVar(name: string): string | undefined {
    return process.env[name];
}

/**
 * Application configuration loaded from environment variables.
 * @typedef {Object} Config
 * @property {string} DISCORD_TOKEN - The token for authenticating with Discord.
 * @property {string} GUILD_ID - The Discord guild (server) ID.
 * @property {string} DEV_ROLE_ID - The role ID for bot developers or admins.
 * @property {string} MEMBER_ROLE_ID - The role ID granted to verified members.
 * @property {string | undefined} SUPABASE_URL - The URL of the Supabase instance (optional).
 * @property {string | undefined} SUPABASE_ANON_KEY - The Supabase anon API key (optional).
 * @property {boolean} SUPABASE_ENABLED - Whether Supabase functionality is available.
 * @property {number} WEB_PORT - Port for the web interface (default: 3000).
 * @property {string} WEB_SECRET - Secret key for web interface authentication.
 */
interface Config {
    DISCORD_TOKEN: string;
    GUILD_ID: string;
    DEV_ROLE_ID: string;
    MEMBER_ROLE_ID: string;
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
    SUPABASE_ENABLED: boolean;
    WEB_PORT: number;
    WEB_SECRET: string;
}

/**
 * Configuration object built at startup by reading required and optional environment variables.
 * @type {Config}
 */
const config: Config = {
    DISCORD_TOKEN: getEnvVar("DISCORD_TOKEN"),
    GUILD_ID: getEnvVar("GUILD_ID"),
    DEV_ROLE_ID: getEnvVar("DEV_ROLE_ID"),
    MEMBER_ROLE_ID: getEnvVar("MEMBER_ROLE_ID"),
    SUPABASE_URL: getOptionalEnvVar("SUPABASE_URL"),
    SUPABASE_ANON_KEY: getOptionalEnvVar("SUPABASE_ANON_KEY"),
    SUPABASE_ENABLED: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
    WEB_PORT: parseInt(getOptionalEnvVar("WEB_PORT") || "3000"),
    WEB_SECRET: getOptionalEnvVar("WEB_SECRET") || "your-secret-key-change-this",
};

export default config;
