# Deployment Guide for Discord Bot

This guide will help you deploy your Discord bot to a cloud service so it can run 24/7 without keeping your computer on.

## 🚀 Quick Deployment Options

### Option 1: Railway (Recommended for Beginners)

**Railway** is the easiest option for beginners. It offers a generous free tier and simple deployment.

#### Step 1: Prepare Your Bot

1. Make sure your bot is working locally with all features configured
2. Create a GitHub repository and push your bot code
3. Ensure you have both `.env` and `data/bot-config.json` files configured
4. Test all 9 commands locally before deploying

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
SUPABASE_URL=your_supabase_url (if using verification/calendar)
SUPABASE_ANON_KEY=your_supabase_key (if using verification/calendar)
WEB_PORT=3000
```

### Option 2: Heroku

**Heroku** is another popular option with a free tier (with limitations).

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
heroku config:set SUPABASE_URL=your_supabase_url
heroku config:set SUPABASE_ANON_KEY=your_supabase_key
```

### Option 3: DigitalOcean (For More Control)

**DigitalOcean** gives you a virtual server to run your bot with full control.

#### Step 1: Create Droplet

1. Go to [digitalocean.com](https://digitalocean.com)
2. Sign up and create a new Droplet
3. Choose Ubuntu 22.04 LTS as the operating system
4. Select the $6/month plan (minimum recommended)

#### Step 2: Connect to Your Server

1. Use SSH to connect to your server
2. Install Node.js v18+ and npm
3. Upload your bot files
4. Install dependencies and start the bot with PM2 for persistence

## 🗄️ Database Setup (Supabase)

### Why Use Supabase?

If you want these advanced features, you'll need Supabase:
- ✅ Member verification system (`/verify` command)
- ✅ Event calendar (`/calendar` command)  
- ✅ Automatic membership expiration notifications
- ✅ Admin tools for member management

### Setting Up Supabase

#### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account (50,000 monthly active users included)
3. Create a new project
4. Choose a database password (save this securely)

#### Step 2: Create Required Tables

In the Supabase SQL Editor, run these commands:

```sql
-- Member list table (import your membership data here)
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

-- Verified members table (managed automatically by bot)
CREATE TABLE verified_members (
    discord_id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    discord_username TEXT NOT NULL,
    verified_at TIMESTAMP DEFAULT NOW()
);

-- Events table (optional - for calendar feature)
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

#### Step 3: Create Required SQL Function

**⚠️ CRITICAL**: This function is required for the `/check-expiring` command to work:

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

#### Step 4: Import Your Member Data

1. Prepare a CSV file with your member list
2. Include columns: full_name, email, end_date (in DD/MM/YY format)
3. Use Supabase Table Editor to import the CSV
4. Verify data imported correctly

#### Step 5: Set Up Row Level Security (Optional)

For added security, enable RLS:

```sql
-- Enable RLS
ALTER TABLE member_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE verified_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow read access (adjust policies as needed)
CREATE POLICY "Allow read access" ON member_list FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON verified_members FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON events FOR SELECT USING (true);
```

#### Step 6: Get Your Credentials

1. Go to Project Settings → API
2. Copy your Project URL (looks like: https://xxx.supabase.co)
3. Copy your anon/public API key
4. Add these to your environment variables

## 🔧 Environment Variables Explained

### Required Variables (Core Bot Functionality)

- **DISCORD_TOKEN**: Your bot's secret token from Discord Developer Portal
- **GUILD_ID**: Your Discord server ID (right-click server → Copy Server ID)
- **DEV_ROLE_ID**: Role ID for bot administrators (right-click role → Copy Role ID)
- **MEMBER_ROLE_ID**: Role ID for verified members

### Optional Variables (Advanced Features)

- **SUPABASE_URL**: Your Supabase project URL (enables `/verify`, `/calendar`, member management)
- **SUPABASE_ANON_KEY**: Your Supabase anonymous key
- **WEB_PORT**: Port for web interface (default: 3000)

## 📋 Pre-Deployment Checklist

Before deploying, make sure you have:

- [ ] Created a Discord bot in the Discord Developer Portal
- [ ] Generated a bot token and enabled proper intents
- [ ] Invited the bot to your server with correct permissions
- [ ] Set up the required roles in your Discord server
- [ ] Configured all bot settings using the web interface
- [ ] Tested all 9 commands locally
- [ ] Created `.env` and `data/bot-config.json` files
- [ ] (Optional) Set up Supabase with required tables and functions
- [ ] (Optional) Imported member data if using verification
- [ ] Pushed your code to a Git repository (GitHub, GitLab, etc.)

## 🎯 Bot Features After Deployment

### Core Commands (Always Available)
- `/whoami` - Customized bot information with your branding
- `/ping` - Bot latency check
- `/commands` - Organized command help
- `/8ball` - Magic 8-ball responses
- `/cat` - Random cat HTTP status images
- `/flip` - Coin flip game

### Advanced Commands (Require Supabase)
- `/verify` - Member verification with role assignment
- `/calendar` - Event calendar with filtering
- `/check-expiring` - Admin tool for membership management

### Automated Features
- **Membership Expiration**: Automatic DM notifications to expiring members
- **Role Management**: Automatic role assignment and restoration
- **Activity Status**: Custom bot presence reflecting your organization
- **Branded Embeds**: All responses use your custom colors and messaging

## 🚨 Common Issues and Solutions

### Bot Not Responding After Deployment

- Check cloud service logs for error messages
- Verify all environment variables are set correctly
- Ensure Discord token hasn't expired or been regenerated
- Check if the bot is still in your Discord server

### Database Connection Issues

- Verify Supabase URL and key are correct
- Check if Supabase project is still active (free tier limits)
- Ensure all required tables and functions exist
- Test database connection from Supabase dashboard

### Commands Not Working

- Verify bot permissions in Discord server
- Check that slash commands are registered (may take time)
- Ensure role IDs are still valid
- Look for error messages in deployment logs

### Configuration Problems

- Ensure `data/bot-config.json` is properly formatted
- Verify all required fields are filled out
- Check that channel IDs are valid (if using verification)
- Test configuration locally before deploying

## 💰 Cost Comparison

| Service      | Free Tier | Monthly Cost | Features | Ease of Use |
| ------------ | --------- | ------------ | -------- | ----------- |
| Railway      | 500 hrs    | $5+ after limit | Auto-deploy, scaling | ⭐⭐⭐⭐⭐ |
| Heroku       | 550 hrs    | $7+/month | Add-ons, simple deploy | ⭐⭐⭐⭐ |
| DigitalOcean | None       | $6+/month | Full control, VPS | ⭐⭐⭐ |
| Supabase     | 50k users  | $25+/month after | Database, realtime | ⭐⭐⭐⭐ |

**💡 Recommended Setup**: Railway (bot hosting) + Supabase (database) = ~$5-10/month total

## 🔒 Security Best Practices

1. **Never share your bot token** - Treat it like a password!
2. **Use environment variables** - Don't hardcode sensitive data in your code
3. **Regular backups** - Export your Supabase data periodically
4. **Monitor logs** - Check for unusual activity or errors
5. **Update dependencies** - Keep your bot and packages updated
6. **Secure your repository** - Never commit `.env` files to Git
7. **Rotate tokens** - Regenerate tokens if compromised

## 📊 Monitoring Your Bot

### Health Checks
- Monitor bot uptime and response rates
- Set up alerts for when bot goes offline
- Check Discord server for bot status
- Review cloud service metrics

### Database Monitoring  
- Monitor Supabase usage (rows, bandwidth)
- Check for failed verification attempts
- Review member growth and retention
- Monitor event calendar usage

### Performance Optimization
- Monitor command response times
- Check memory and CPU usage
- Optimize database queries if needed
- Scale resources as community grows

## 📞 Getting Help

If you encounter deployment issues:

1. **Check the logs** in your cloud service dashboard
2. **Test locally** to isolate cloud-specific problems
3. **Verify configuration** using the web interface
4. **Check Discord** for bot permissions and status
5. **Review documentation** for your hosting platform
6. **Search communities** for similar issues
7. **Ask for help** with specific error messages

## 🎉 Success!

Once deployed successfully, your bot will:

- ✅ **Run 24/7** without your computer being on
- ✅ **Auto-restart** if it crashes
- ✅ **Scale automatically** with your community growth  
- ✅ **Provide advanced features** like member verification
- ✅ **Send automated notifications** for expiring memberships
- ✅ **Maintain your branding** consistently across all interactions

Your Discord community now has a professional, fully-featured bot that reflects your organization's identity and supports your community management needs!

## 🔄 Ongoing Maintenance

### Regular Tasks
- **Monitor bot health** and uptime
- **Update member data** in Supabase as needed
- **Add events** to calendar for upcoming activities
- **Review and adjust** bot messages and branding
- **Check logs** for errors or issues
- **Update dependencies** periodically

### Community Growth
- **Monitor verification** success rates
- **Gather feedback** from members on bot features
- **Adjust commands** and messages based on usage
- **Scale hosting** resources as needed
- **Add new features** as your community evolves

Remember: A well-maintained bot becomes an essential part of your community infrastructure!
