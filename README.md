# Discord Bot Generator

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg?style=for-the-badge)
![NodeJS](https://img.shields.io/badge/NodeJS-v22%2B-%235FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white&logoSize=auto)
![Prettier](https://img.shields.io/badge/Prettier-%23F7B93E?style=for-the-badge&logo=prettier&logoColor=black&logoSize=auto)

A **user-friendly Discord bot generator** with a beautiful web interface for easy customization and setup. Perfect for non-technical users who want to create a custom Discord bot for their community without writing code.

## ✨ Features

- 🤖 **Customizable Discord Bot** - Fully configurable bot responses and behavior
- 🌐 **Web Configuration Interface** - Beautiful, intuitive web UI for bot customization
- 🔧 **Environment Variable Management** - Easy setup of Discord tokens and API keys
- 📝 **Command Customization** - Customize what your bot says for each command
- 🎨 **Visual Customization** - Change colors, messages, and branding
- 📊 **Member Verification** - Optional Supabase integration for member management
- 📅 **Event Calendar** - Optional calendar functionality for community events
- 🎮 **Fun Commands** - Built-in entertainment commands (8ball, cat, flip, etc.)

## 🚀 Quick Start

### For Non-Technical Users

1. **Download and Extract**

    - Download the bot files
    - Extract to a folder on your computer

2. **Install Node.js**

    - Download and install Node.js from [nodejs.org](https://nodejs.org/)
    - Choose the LTS version

3. **Start the Web Interface**

    ```bash
    npm install
    npm run web
    ```

4. **Configure Your Bot**

    - Open your web browser and go to `http://localhost:3000`
    - Use the web interface to configure your bot settings
    - Enter your Discord bot token and server information
    - Customize messages, colors, and button links

5. **Start Your Bot**
    ```bash
    npm run build
    npm start
    ```

### For Technical Users

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd discord-bot-generator
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
    WEB_PORT=3000
    WEB_SECRET=your_secret_key
    ```

4. **Start the web interface**

    ```bash
    npm run web
    ```

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
│   ├── web/             # Web interface
│   │   ├── public/      # Static web files
│   │   └── server.ts    # Web server
│   └── index.ts         # Main bot entry point
├── data/                # Bot configuration storage
├── .env                 # Environment variables
└── package.json         # Project dependencies
```

## 🎛️ Web Interface Features

### Bot Customization Tab

- **General Settings**: Bot name, colors, branding
- **Command Customization**: Customize `/whoami` command responses
- **Button Configuration**: Set up external links and social media buttons
- **Message Customization**: Welcome and verification messages

### Environment Variables Tab

- **Required Variables**: Discord token, server ID, role IDs
- **Optional Variables**: Supabase credentials, web interface settings
- **Validation**: Automatic validation of required fields
- **Export**: Generate `.env` file for deployment

## 🤖 Available Commands

### General Commands

- `/whoami` - Display bot information (fully customizable)
- `/ping` - Check bot latency
- `/man` - Show command help

### Fun Commands

- `/8ball` - Magic 8-ball responses
- `/cat` - Random cat images
- `/flip` - Coin flip

### Utility Commands (with Supabase)

- `/verify` - Member verification system
- `/calendar` - Event calendar management

## 🌐 Deployment Options

### Local Development

```bash
npm run dev          # Start bot in development mode
npm run web          # Start web interface
```

### Production Deployment

```bash
npm run build        # Build the project
npm start            # Start the bot
npm run web:build    # Build and start web interface
```

### Cloud Hosting

The bot can be easily deployed to:

- **Railway** - Simple deployment with automatic scaling
- **Heroku** - Popular platform with free tier
- **DigitalOcean** - VPS hosting with full control
- **AWS/GCP** - Enterprise cloud solutions

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
| `WEB_PORT`          | Web interface port         | ❌       |
| `WEB_SECRET`        | Web interface secret key   | ❌       |

### Bot Configuration

All bot customization is stored in `data/bot-config.json` and can be managed through the web interface.

## 🛠️ Development

### Prerequisites

- Node.js v22 or higher
- npm or yarn package manager

### Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run format       # Format code with Prettier
npm run web          # Start web interface
```

### Adding New Commands

1. Create a new file in `src/commands/[category]/`
2. Export `data` and `run` functions
3. The command will be automatically registered

### Adding New Features

1. Extend the `BotConfig` interface in `src/utils/botConfig.ts`
2. Add UI elements to the web interface
3. Update the API endpoints in `src/web/server.ts`

## 📚 Documentation

### For Users

- [Getting Started Guide](docs/getting-started.md)
- [Web Interface Tutorial](docs/web-interface.md)
- [Deployment Guide](docs/deployment.md)

### For Developers

- [Command Development](docs/commands.md)
- [API Reference](docs/api.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [discord.js](https://discord.js.org) - Powerful Discord API wrapper
- [CommandKit](https://commandkit.js.org) - Command and event handler
- [Supabase](https://supabase.com) - Open-source Firebase alternative
- [Express](https://expressjs.com) - Web framework for the configuration interface

---

<p align="center">
  <strong>Made with ❤️ for the Discord community</strong>
</p>
