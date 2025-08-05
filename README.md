# Deakin Discord Bot Generator

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg?style=for-the-badge)
![NodeJS](https://img.shields.io/badge/NodeJS-v22%2B-%235FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white&logoSize=auto)
![Prettier](https://img.shields.io/badge/Prettier-%23F7B93E?style=for-the-badge&logo=prettier&logoColor=black&logoSize=auto)

A **comprehensive Discord bot generator** designed to help student organisations, clubs, and communities create fully customized Discord bots without any coding knowledge. Features a complete web-based configuration system and professional-grade functionality.

## ✨ Features

- 🤖 **9 Customizable Commands** - Complete suite of core, fun, and utility commands
- 🎨 **Complete Visual Customisation** - Colors, branding, messages, and bot activity
- 📝 **No-Code Configuration** - Web interface for every aspect of customisation
- 🔧 **Channel ID Management** - Easy Discord channel linking without code editing
- 📊 **Member Verification System** - Optional Supabase integration for membership management
- 📅 **Event Calendar** - Community event management with category filtering
- 🎮 **Entertainment Commands** - Built-in fun commands (8ball, cat, flip, etc.)
- 🛡️ **Admin Tools** - Membership expiration tracking and notification system
- 🌐 **One-Click Deployment** - Ready for Railway, Heroku, DigitalOcean
- 📱 **Professional UI** - Mobile-friendly configuration interface

## 🎮 Complete Command Suite

### Core Commands (Always Available)

- `/whoami` - **Fully customizable** bot information with your branding and external links
- `/ping` - Bot latency and response time checking
- `/commands` - Organized help system showing all available commands

### Fun Commands (Always Available)

- `/8ball <question>` - Magic 8-ball with customizable responses
- `/cat` - Random cat HTTP status code images for developer humor
- `/flip` - Virtual coin flip with custom messaging

### Utility Commands (Require Supabase Setup)

- `/verify <email>` - **Complete membership verification system** with role assignment
- `/calendar [category]` - **Event calendar** with filtering (CTF, networking, etc.)
- `/check-expiring` - **[ADMIN ONLY]** Membership expiration management tool

### Automated Features

- 🔄 **Membership Expiration Notifications** - Automatic DM alerts to expiring members
- 👤 **Role Management** - Automatic role assignment and restoration
- 📱 **Custom Bot Presence** - Configurable activity status
- 🎨 **Branded Embeds** - All responses use your organization's colors and messaging

## 🚀 Quick Start

### For Non-Technical Users

🎥 **Video Guide**: [Coming Soon]

1. **Use Our Web Interface** - Visit our [Config Generator](https://duca-club.github.io/deakin-club-bot/)
2. **Configure Everything** - Customize all 9 commands, messages, and branding
3. **Download Files** - Get ready-to-deploy configuration files
4. **One-Click Deploy** - Use Railway, Heroku, or DigitalOcean

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

3. **Configure via Web Interface OR use our hosted site**

    ```bash
    npm run web
    # Visit http://localhost:3000 to configure your bot
    ```

4. **Set up environment variables**
   Download `.env` from web interface or create manually:

    ```env
    DISCORD_TOKEN=your_discord_bot_token
    GUILD_ID=your_discord_server_id
    DEV_ROLE_ID=developer_role_id
    MEMBER_ROLE_ID=member_role_id
    SUPABASE_URL=your_supabase_url (optional)
    SUPABASE_ANON_KEY=your_supabase_key (optional)
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
│   ├── commands/          # Discord slash commands
│   │   ├── fun/          # Entertainment commands (8ball, cat, flip)
│   │   ├── misc/         # Core commands (whoami, ping, commands)
│   │   └── utility/      # Advanced commands (verify, calendar, check-expiring)
│   ├── config/           # Configuration management
│   ├── events/           # Discord event handlers (ready, activity)
│   ├── lib/              # External integrations (Supabase)
│   ├── utils/            # Bot configuration, logging, scheduling
│   └── index.ts          # Main bot entry point
├── docs/                 # Complete documentation
│   ├── index.html        # Web configuration interface
│   ├── example.html      # DUCA example configuration
│   ├── deployment-guide.md # Cloud deployment instructions
├── data/                 # Bot configuration storage
│   └── bot-config.json   # Generated configuration file
├── .env                  # Environment variables
└── package.json          # Project dependencies
```

## 🎛️ Complete Customisation System

### Using the Web Configuration Interface

Our [Config Generator](https://duca-club.github.io/deakin-club-bot/) allows you to:

**🎨 General Branding**

- Custom bot name and organization name
- Brand colors and visual theming
- Custom bot activity status (Watching, Playing, etc.)

**📝 Command Customisation**

- Personalized descriptions for all 9 commands
- Custom command responses and error messages
- Organization-specific terminology and tone

**🔗 External Integration**

- Social media buttons (Join, Socials, GitHub)
- Channel linking without code editing
- Custom verification messages and flows

**📊 Advanced Features**

- Member verification system configuration
- Event calendar setup and categorization
- Automated membership expiration handling
- Admin notification systems

### Manual Configuration

All settings are stored in `data/bot-config.json` with comprehensive options for:

- Bot appearance and branding
- Command descriptions and responses
- Verification system messages
- Channel configurations
- Membership expiration notices

## 🗄️ Database Setup (Optional - Enables Advanced Features)

### Supabase Configuration

For member verification and calendar features, set up Supabase:

#### 1. Create Required Tables

```sql
-- Member list (import your membership data)
CREATE TABLE member_list (
    full_name TEXT NOT NULL,
    student_id TEXT,
    email TEXT PRIMARY KEY,
    campus TEXT,
    first_subscription_date TEXT,
    last_paid_date TEXT,
    end_date TEXT,
    faculty TEXT,
    new_renewal TEXT,
    payment_option_type TEXT
);

-- Verified members (managed by bot)
CREATE TABLE verified_members (
    discord_id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    discord_username TEXT NOT NULL,
    verified_at TIMESTAMP DEFAULT NOW()
);

-- Events calendar (optional)
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location TEXT,
    category TEXT CHECK (category IN ('ctf', 'essentials', 'networking', 'pentesting')),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. **CRITICAL**: Create Required SQL Function

**⚠️ This function is required for membership expiration features:**

```sql
CREATE OR REPLACE FUNCTION get_expiring_members(expire_date text)
RETURNS TABLE (
    discord_id text,
    discord_username text,
    full_name text,
    end_date text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        vm.discord_id::text,
        vm.discord_username,
        vm.full_name,
        vm.end_date
    FROM verified_members vm
    WHERE vm.end_date = expire_date;
END;
$$ LANGUAGE plpgsql;
```

## 🌐 Deployment Options

### Recommended: Railway + Supabase

**Monthly Cost**: ~$5-10 total

- ✅ Railway: Bot hosting with auto-scaling
- ✅ Supabase: Database with 50k free users
- ✅ One-click deployment from GitHub
- ✅ Automatic restarts and monitoring

### Alternative Options

- **Heroku**: Popular platform ($7+/month)
- **DigitalOcean**: Full VPS control ($6+/month)
- **Self-hosted**: Use your own server

**📚 Full deployment guides available in [docs/deployment-guide.md](docs/deployment-guide.md)**

## 🔧 Environment Variables

| Variable            | Description             | Required | Purpose                 |
| ------------------- | ----------------------- | -------- | ----------------------- |
| `DISCORD_TOKEN`     | Discord bot token       | ✅       | Bot authentication      |
| `GUILD_ID`          | Discord server ID       | ✅       | Server targeting        |
| `DEV_ROLE_ID`       | Admin role ID           | ✅       | Permission management   |
| `MEMBER_ROLE_ID`    | Verified member role ID | ✅       | Verification system     |
| `SUPABASE_URL`      | Supabase project URL    | ❌       | Database connection     |
| `SUPABASE_ANON_KEY` | Supabase API key        | ❌       | Database authentication |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](https://amazing-gouda-6a9.notion.site/Contribution-Guidelines-22f9d9519fee8166b305ec7dba04c03f) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Test changes with web interface
4. Add documentation if needed
5. Submit a pull request

## 🌟 What Makes This Special

- **Zero-Code Customisation** - Everything configurable via web interface
- **Production Ready** - Used by real organisations like DUCA
- **Comprehensive** - Covers all aspects of Discord bot management
- **Professional** - Branded, consistent experience across all interactions
- **Scalable** - Grows with your community from small clubs to large organisations
- **Modern** - Built with current best practices and technologies

## 🙏 Acknowledgments

- [discord.js](https://discord.js.org) - Powerful Discord API wrapper
- [CommandKit](https://commandkit.js.org) - Elegant command and event handling
- [Supabase](https://supabase.com) - Open-source Firebase alternative
- **DUCA Members** - Real-world testing and feedback
- **Open Source Community** - Inspiration and technical foundation

---

**Need help?**

- 📖 Check our [documentation](docs/)
- 💬 Join the [DUCA Discord Server](https://discord.gg/duca)
- 🐛 Report issues on [GitHub](https://github.com/duca-club/deakin-club-bot/issues)

**Ready to create your community's perfect Discord bot?** Start with our [Config Generator](https://duca-club.github.io/deakin-club-bot/) today!
