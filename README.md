# Deakin Discord Bot Generator

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)
![NodeJS](https://img.shields.io/badge/NodeJS-v22%2B-%235FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white&logoSize=auto)
![Prettier](https://img.shields.io/badge/Prettier-%23F7B93E?style=for-the-badge&logo=prettier&logoColor=black&logoSize=auto)

A **user-friendly Discord bot generator** made specifically to help Deakin student-run clubs manage their server, with easy customisation and setup. Perfect for non-technical users who want to create a custom Discord bot for their community without writing code.

## ✨ Features

- 🤖 **Customisable Discord Bot** - Fully configurable bot responses and behavior
- 🔧 **Environment Variable Management** - Easy setup of Discord tokens and API keys
- 📝 **Command Customisation** - Customise what your bot says for each command
- 🎨 **Visual Customisation** - Change colour, messages, and branding
- 📊 **Member Verification** - Optional Supabase integration for member management
- 📅 **Event Calendar** - Optional calendar functionality for community events
- 🎮 **Fun Commands** - Built-in entertainment commands (8ball, cat, flip, etc.)

## 🚀 Quick Start

### For Non-Technical Users

Please follow this video guide:  
**COMING SOON**


### For Technical Users

1. **Clone the repository**

    ```bash
    git clone https://github.com/duca-club/deakin-club-bot.git
    cd deakin-club-bot
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

    ```env
    DISCORD_TOKEN=your_discord_bot_token
    GUILD_ID=your_discord_server_id
    DEV_ROLE_ID=developer_role_id
    MEMBER_ROLE_ID=member_role_id
    SUPABASE_URL=your_supabase_url (optional)
    SUPABASE_ANON_KEY=your_supabase_key (optional)
    ```

4. **Create bot configuration**
   Create a `data/bot-config.json` file with your bot settings, or use our [Config Generator](https://duca-club.github.io/deakin-club-bot/)

5. **Build and start the bot**
    ```bash
    npm run build
    npm start
    ```

## 📂 Project Structure

```
discord-bot-generator/
├── src/
│   ├── commands/        # Discord slash commands
│   │   ├── fun/         # Entertainment commands
│   │   ├── misc/        # General utility commands
│   │   └── utility/     # Advanced utility commands
│   ├── config/          # Configuration management
│   ├── events/          # Discord event handlers
│   ├── lib/             # External service integrations
│   ├── utils/           # Utility functions
│   └── index.ts         # Main bot entry point
├── data/                # Bot configuration storage
├── .env                 # Environment variables
└── package.json         # Project dependencies
```

## 🎛️ Configuration

### Using the Config Generator

We provide a standalone [Config Generator](https://duca-club.github.io/deakin-club-bot/) that allows you to:

- **Customise Bot Settings**: Bot name, colors, branding, messages
- **Configure Commands**: Customise descriptions and titles for all slash commands
- **Set Up Buttons**: Configure external links for the `/whoami` command
- **Manage Environment Variables**: Set up Discord tokens and server information
- **Download Files**: Generate ready-to-use configuration files

### Manual Configuration

All bot customisation is stored in `data/bot-config.json` and can be edited manually.

## 🤖 Available Commands

### General Commands

- `/whoami` - Display bot information (fully customisable)
- `/ping` - Check bot latency
- `/commands` - Show command help

### Fun Commands

- `/8ball` - Magic 8-ball responses
- `/cat` - Random cat images
- `/flip` - Coin flip

### Utility Commands (with Supabase)

- `/verify` - Member verification system
- `/calendar` - Event calendar management

**With more features always on the way!**

## 🌐 Deployment Options

### Cloud Hosting

You can expext to spend $5-$10/month however due to ease of deployment and maintenance, we recommend deploying the bot with:  
- **Railway** - Simple deployment with automatic scaling
- **Heroku** - Popular platform with free tier
- **DigitalOcean** - VPS hosting with full control

We do also provide instructions for freely hosting the bot using Deakin's GitLab resources, outlined in the instructional video [here]() (COMING SOON).

## 🔧 Configuration

### Environment Variables

| Variable            | Description                | Required |
| ------------------- | -------------------------- | -------- |
| `DISCORD_TOKEN`     | Your Discord bot token     | ✅       |
| `GUILD_ID`          | Discord server ID          | ✅       |
| `DEV_ROLE_ID`       | Developer role ID          | ✅       |
| `MEMBER_ROLE_ID`    | Member role ID             | ✅       |
| `SUPABASE_URL`      | Supabase project URL       | ❌       |
| `SUPABASE_ANON_KEY` | Supabase anonymous API key | ❌       |

### Bot Configuration

All bot customisation is stored in `data/bot-config.json` and can be managed through our [Config Generator](https://duca-club.github.io/deakin-club-bot/).

## 🛠️ Development

### Prerequisites

- Node.js v22 or higher
- npm or yarn package manager

### Adding New Commands

1. Create a new file in `src/commands/[category]/`
2. Export `data` and `run` functions
3. The command will be automatically registered

### Adding New Features

1. Extend the `BotConfig` interface in `src/utils/botConfig.ts`
2. Update the [Config Generator](https://duca-club.github.io/deakin-club-bot/) to include new options

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](https://amazing-gouda-6a9.notion.site/Contribution-Guidelines-22f9d9519fee8166b305ec7dba04c03f) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🙏 Acknowledgments

- [discord.js](https://discord.js.org) - Powerful Discord API wrapper
- [CommandKit](https://commandkit.js.org) - Command and event handler
- [Supabase](https://supabase.com) - Open-source Firebase alternative

---

**Need help configuring your bot?** Reach out to the programming team in the [DUCA Discord Server](https://discord.gg/4xNnxkSgUH)!
