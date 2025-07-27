import config from "./config/config.js";
import { Client, IntentsBitField } from "discord.js";
import { CommandKit } from "commandkit";
import { dirname as dn } from "node:path";
import { fileURLToPath } from "node:url";

const dirname = dn(fileURLToPath(import.meta.url));
const { DISCORD_TOKEN, DEV_ROLE_ID, GUILD_ID } = config;

/**
 * Discord.js client configured with necessary gateway intents.
 * @type {Client<true>}
 */
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

new CommandKit({
    client,
    eventsPath: `${dirname}/events`,
    commandsPath: `${dirname}/commands`,
    devGuildIds: [GUILD_ID],
    devRoleIds: [DEV_ROLE_ID],
    bulkRegister: true,
});

// Client ready event
client.once("ready", () => {
    console.log(`Bot is ready! Logged in as ${client.user?.tag}`);
});

client.login(DISCORD_TOKEN);
