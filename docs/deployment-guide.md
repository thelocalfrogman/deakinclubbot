# Deployment Guide for Non-Technical Users

This guide will help you deploy your Discord bot to a cloud service so it can run 24/7 without keeping your computer on.

## 🚀 Quick Deployment Options

### Option 1: Railway (Recommended for Beginners)

**Railway** is the easiest option for beginners. It offers a free tier and simple deployment.

#### Step 1: Prepare Your Bot

1. Make sure your bot is working locally
2. Create a GitHub repository and push your bot code
3. Ensure you have a `.env` file with all your configuration

#### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your bot repository
5. Railway will automatically detect it's a Node.js project
6. Add your environment variables in the Railway dashboard
7. Your bot will start automatically!

#### Step 3: Configure Environment Variables

In the Railway dashboard, go to your project → Variables tab and add:

```
DISCORD_TOKEN=your_discord_bot_token
GUILD_ID=your_discord_server_id
DEV_ROLE_ID=your_developer_role_id
MEMBER_ROLE_ID=your_member_role_id
SUPABASE_URL=your_supabase_url (if using)
SUPABASE_ANON_KEY=your_supabase_key (if using)
WEB_PORT=3000
WEB_SECRET=your_secret_key
```

### Option 2: Heroku

**Heroku** is another popular option with a free tier.

#### Step 1: Create Heroku Account

1. Go to [heroku.com](https://heroku.com)
2. Sign up for a free account
3. Install the Heroku CLI on your computer

#### Step 2: Deploy Your Bot

1. Open terminal/command prompt
2. Navigate to your bot folder
3. Run these commands:

```bash
heroku login
heroku create your-bot-name
git add .
git commit -m "Initial deployment"
git push heroku main
```

#### Step 3: Set Environment Variables

```bash
heroku config:set DISCORD_TOKEN=your_discord_bot_token
heroku config:set GUILD_ID=your_discord_server_id
heroku config:set DEV_ROLE_ID=your_developer_role_id
heroku config:set MEMBER_ROLE_ID=your_member_role_id
```

### Option 3: DigitalOcean (For More Control)

**DigitalOcean** gives you a virtual server to run your bot.

#### Step 1: Create Droplet

1. Go to [digitalocean.com](https://digitalocean.com)
2. Sign up and create a new Droplet
3. Choose Ubuntu as the operating system
4. Select the $5/month plan (minimum)

#### Step 2: Connect to Your Server

1. Use SSH to connect to your server
2. Install Node.js and npm
3. Upload your bot files
4. Install dependencies and start the bot

## 🔧 Environment Variables Explained

### Required Variables

- **DISCORD_TOKEN**: Your bot's secret token from Discord Developer Portal
- **GUILD_ID**: Your Discord server ID (right-click server → Copy Server ID)
- **DEV_ROLE_ID**: Role ID for bot developers (right-click role → Copy Role ID)
- **MEMBER_ROLE_ID**: Role ID for verified members

### Optional Variables

- **SUPABASE_URL**: Your Supabase project URL (for member verification)
- **SUPABASE_ANON_KEY**: Your Supabase anonymous key
- **WEB_PORT**: Port for web interface (default: 3000)
- **WEB_SECRET**: Secret key for web interface security

## 📋 Pre-Deployment Checklist

Before deploying, make sure you have:

- [ ] Created a Discord bot in the Discord Developer Portal
- [ ] Generated a bot token
- [ ] Invited the bot to your server
- [ ] Set up the required roles in your Discord server
- [ ] Tested the bot locally
- [ ] Created a `.env` file with all required variables
- [ ] Pushed your code to a Git repository (GitHub, GitLab, etc.)

## 🚨 Common Issues and Solutions

### Bot Not Responding

- Check if the bot is online in your Discord server
- Verify your Discord token is correct
- Ensure the bot has the necessary permissions

### Environment Variables Not Working

- Double-check all variable names (they're case-sensitive)
- Make sure there are no extra spaces
- Verify the values are correct

### Bot Goes Offline

- Check your cloud service's logs for errors
- Ensure your bot has proper error handling
- Consider using a process manager like PM2

## 💰 Cost Comparison

| Service      | Free Tier | Paid Plans  | Ease of Use |
| ------------ | --------- | ----------- | ----------- |
| Railway      | ✅ Yes    | $5/month+   | ⭐⭐⭐⭐⭐  |
| Heroku       | ✅ Yes    | $7/month+   | ⭐⭐⭐⭐    |
| DigitalOcean | ❌ No     | $5/month+   | ⭐⭐⭐      |
| AWS          | ✅ Yes    | Pay per use | ⭐⭐        |

## 🔒 Security Best Practices

1. **Never share your bot token** - Keep it secret!
2. **Use environment variables** - Don't hardcode sensitive data
3. **Regular updates** - Keep your bot and dependencies updated
4. **Monitor logs** - Check for unusual activity
5. **Backup configuration** - Keep copies of your bot settings

## 📞 Getting Help

If you encounter issues:

1. **Check the logs** in your cloud service dashboard
2. **Verify your configuration** using the web interface
3. **Test locally** to isolate the problem
4. **Search online** for similar issues
5. **Ask for help** in Discord bot communities

## 🎉 Success!

Once deployed, your bot will:

- Run 24/7 without your computer being on
- Automatically restart if it crashes
- Be accessible from anywhere
- Scale automatically with your needs

Your Discord community will now have a fully functional, customizable bot!
