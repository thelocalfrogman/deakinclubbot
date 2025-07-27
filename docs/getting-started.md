# Getting Started Guide

This guide will walk you through setting up your Discord bot from scratch, even if you have no technical experience.

## 🎯 What You'll Learn

By the end of this guide, you'll have:

- A working Discord bot in your server
- A web interface to customize your bot
- Basic understanding of how to manage your bot

## 📋 Prerequisites

Before starting, you'll need:

- A computer with internet access
- A Discord account
- Basic computer skills (downloading files, using a web browser)

## 🚀 Step-by-Step Setup

### Step 1: Create a Discord Bot

1. **Go to Discord Developer Portal**

    - Open your web browser
    - Go to [discord.com/developers/applications](https://discord.com/developers/applications)
    - Sign in with your Discord account

2. **Create a New Application**

    - Click "New Application"
    - Give your bot a name (e.g., "My Community Bot")
    - Click "Create"

3. **Set Up Your Bot**

    - In the left sidebar, click "Bot"
    - Click "Add Bot"
    - Under "Privileged Gateway Intents", enable:
        - ✅ Presence Intent
        - ✅ Server Members Intent
        - ✅ Message Content Intent
    - Click "Save Changes"

4. **Get Your Bot Token**

    - In the Bot section, click "Reset Token"
    - Copy the token (it looks like a long string of letters and numbers)
    - **Keep this secret!** Don't share it with anyone

5. **Invite Bot to Your Server**
    - In the left sidebar, click "OAuth2" → "URL Generator"
    - Under "Scopes", select "bot"
    - Under "Bot Permissions", select:
        - ✅ Send Messages
        - ✅ Use Slash Commands
        - ✅ Manage Roles
        - ✅ Read Message History
        - ✅ Add Reactions
    - Copy the generated URL and open it in a new tab
    - Select your server and authorize the bot

### Step 2: Get Your Server Information

1. **Enable Developer Mode**

    - Open Discord
    - Go to User Settings → Advanced
    - Turn on "Developer Mode"

2. **Get Server ID**

    - Right-click on your server name
    - Click "Copy Server ID"
    - Save this number

3. **Get Role IDs**
    - Right-click on a role in your server
    - Click "Copy Role ID"
    - Do this for:
        - A role for bot developers (create one if needed)
        - A role for verified members (create one if needed)

### Step 3: Download and Set Up the Bot

1. **Download the Bot Files**

    - Download the bot files from the repository
    - Extract them to a folder on your computer

2. **Install Node.js**

    - Go to [nodejs.org](https://nodejs.org)
    - Download the LTS version (recommended)
    - Install it on your computer

3. **Open Terminal/Command Prompt**

    - On Windows: Press Win+R, type "cmd", press Enter
    - On Mac: Open Terminal from Applications → Utilities
    - On Linux: Open your terminal application

4. **Navigate to Bot Folder**

    ```bash
    cd path/to/your/bot/folder
    ```

5. **Install Dependencies**
    ```bash
    npm install
    ```

### Step 4: Start the Web Interface

1. **Start the Web Server**

    ```bash
    npm run web
    ```

2. **Open the Web Interface**
    - Open your web browser
    - Go to `http://localhost:3000`
    - You should see the bot configuration interface

### Step 5: Configure Your Bot

1. **Go to Environment Variables Tab**

    - Click the "Environment Variables" tab in the web interface

2. **Enter Required Information**

    - **Discord Bot Token**: Paste the token you copied earlier
    - **Guild ID**: Paste your server ID
    - **Developer Role ID**: Paste the developer role ID
    - **Member Role ID**: Paste the member role ID

3. **Save Environment Variables**

    - Click "Save Environment Variables"
    - You should see a success message

4. **Customize Your Bot**
    - Go to the "Bot Customization" tab
    - Customize your bot's name, description, and messages
    - Add links to your community (optional)
    - Click "Save Bot Configuration"

### Step 6: Start Your Bot

1. **Build the Bot**

    ```bash
    npm run build
    ```

2. **Start the Bot**

    ```bash
    npm start
    ```

3. **Test Your Bot**
    - Go to your Discord server
    - Type `/whoami` to test the bot
    - Try other commands like `/ping`, `/8ball`, etc.

## 🎉 Congratulations!

Your Discord bot is now running! Here's what you can do next:

### Basic Commands to Try

- `/whoami` - See bot information
- `/ping` - Check if bot is responsive
- `/8ball` - Ask the magic 8-ball
- `/cat` - Get a random cat image
- `/flip` - Flip a coin

### Customization Options

- Change bot colors and branding
- Customize welcome messages
- Add buttons linking to your social media
- Modify command responses

### Advanced Features (Optional)

- Set up Supabase for member verification
- Configure event calendar functionality
- Add custom commands

## 🔧 Troubleshooting

### Bot Not Responding

- Check if the bot is online in your server
- Verify your token is correct
- Make sure the bot has proper permissions

### Web Interface Not Loading

- Ensure you ran `npm run web`
- Check if port 3000 is available
- Try a different port if needed

### Commands Not Working

- Make sure the bot has "Use Slash Commands" permission
- Check if commands are registered (may take a few minutes)
- Verify your role IDs are correct

## 📚 Next Steps

1. **Deploy to Cloud** - Follow the [Deployment Guide](deployment-guide.md) to run your bot 24/7
2. **Add More Features** - Explore the advanced configuration options
3. **Join Communities** - Connect with other bot developers for help and ideas

## 🆘 Need Help?

If you get stuck:

1. Check the troubleshooting section above
2. Look at the error messages in your terminal
3. Search online for similar issues
4. Ask for help in Discord bot communities

Remember: Everyone starts somewhere! Don't be afraid to experiment and learn as you go.
