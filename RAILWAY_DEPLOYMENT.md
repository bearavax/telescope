# Railway Deployment Guide for Telescope Discord Bot

## Architecture

Your Telescope app requires TWO separate Railway services:
1. **Next.js App Service** - Your main web application
2. **Bot Service** - The Discord bot that receives webhooks and posts to Discord

## Step 1: Deploy the Bot Service

### A. Using Railway CLI

```bash
# Make sure you're in the telescope directory
cd C:\Users\GGPC\Documents\GitHub\telescope

# Link to the bot service
railway service

# Select "bot" from the list

# Deploy the bot
railway up
```

### B. Set Bot Service Environment Variables

Run these commands to set environment variables for the bot:

```bash
# Select the bot service first
railway service
# (choose "bot")

# Set the environment variables
railway variables set DISCORD_BOT_TOKEN="YOUR_DISCORD_BOT_TOKEN_HERE"
railway variables set DISCORD_GENERAL_CHANNEL_ID="881074608537763904"
railway variables set WEBHOOK_SECRET="e64b619ba92a7ab15081ec4a0f63c23c0bc39c7d187262b12858581afe7723a8"
railway variables set BOT_PORT="3001"
```

### C. Get the Bot's Public URL

After deployment, get your bot's URL:

```bash
railway domain
```

This will give you something like: `https://bot-production-xxxx.up.railway.app`

**Copy this URL - you'll need it for Step 2!**

## Step 2: Configure the Next.js App Service

### A. Switch to your main app service

```bash
railway service
# (choose your main Next.js service - NOT "bot")
```

### B. Set the webhook URL to point to your bot

```bash
railway variables set BOT_WEBHOOK_URL="https://YOUR-BOT-URL.up.railway.app"
railway variables set WEBHOOK_SECRET="e64b619ba92a7ab15081ec4a0f63c23c0bc39c7d187262b12858581afe7723a8"
```

Replace `YOUR-BOT-URL` with the actual URL from Step 1C.

## Step 3: Verify Both Services Are Running

```bash
# Check bot service
railway service
# (select "bot")
railway logs

# Check main app service
railway service
# (select your main service)
railway logs
```

## How It Works

```
User posts on forum → Next.js app → Webhook to Bot Service → Bot posts to Discord
```

1. User creates a thread or reply on your forum
2. Next.js app calls the notification function
3. Notification sends a webhook to `BOT_WEBHOOK_URL/webhook/forum-activity`
4. Bot receives webhook, validates secret, posts to Discord channel `881074608537763904`

## Testing

1. Create a test thread on your forum
2. Check your Discord channel (ID: 881074608537763904)
3. You should see a rich embed with the thread details

## Troubleshooting

### Bot not receiving webhooks?
- Check `BOT_WEBHOOK_URL` is set correctly in your Next.js service
- Verify `WEBHOOK_SECRET` matches in both services
- Check bot logs: `railway service` → select "bot" → `railway logs`

### Notifications not appearing in Discord?
- Verify `DISCORD_GENERAL_CHANNEL_ID` is correct (881074608537763904)
- Check bot has permission to post in that channel
- Review bot logs for errors

### Check bot health
Visit: `https://YOUR-BOT-URL.up.railway.app/health`

Should return:
```json
{
  "status": "ok",
  "bot": "connected",
  "uptime": 123.456
}
```

## Quick Command Reference

```bash
# Switch services
railway service

# Deploy
railway up

# View logs
railway logs

# Set variables
railway variables set KEY="VALUE"

# Get domain
railway domain
```
