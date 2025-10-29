# Discord Forum Notifications Setup

This guide explains how to configure the Discord bot to post forum thread activity to your general chat channel.

## Prerequisites

- Discord bot token (already configured in `.env`)
- Discord server with the bot added
- A general chat channel where you want notifications

## Configuration Steps

### 1. Get Your General Channel ID

1. Enable Developer Mode in Discord:
   - User Settings → Advanced → Developer Mode (turn ON)
2. Right-click on your general chat channel
3. Click "Copy Channel ID"

### 2. Generate a Webhook Secret

Run this command to generate a secure random secret:

\`\`\`bash
openssl rand -hex 32
\`\`\`

### 3. Update Your .env File

Add these variables to your \`.env\` file:

\`\`\`env
# Discord Bot Configuration (for forum notifications)
DISCORD_GENERAL_CHANNEL_ID=your_channel_id_here
BOT_PORT=3001

# Webhook security
WEBHOOK_SECRET=your_generated_secret_here
BOT_WEBHOOK_URL=http://localhost:3001
\`\`\`

For production deployments, update \`BOT_WEBHOOK_URL\` to your bot's public URL.

### 4. Start the Discord Bot

The bot runs as a separate process from your Next.js app:

\`\`\`bash
npm run bot
\`\`\`

You should see:
\`\`\`
✅ Discord Bot is now ONLINE!
🤖 Logged in as: YourBot#1234
📢 Forum notifications will be posted to channel: 123456789
🌐 Webhook server listening on port 3001
\`\`\`

### 5. Start Your Next.js App

In a separate terminal:

\`\`\`bash
npm run dev
\`\`\`

## How It Works

1. When a user creates a new forum thread, the API calls \`notifyNewThread()\`
2. When a user replies to a thread, the API calls \`notifyNewReply()\`
3. These functions send webhook requests to the bot's Express server
4. The bot validates the webhook secret and posts an embed to your Discord channel

## Notification Format

### New Thread
- **Title**: Thread subject (clickable link to the thread)
- **Board**: Which board the thread was posted in
- **Author**: Username or "Anonymous"
- **Description**: Preview of the thread content (up to 400 characters)
- **Image**: Thread image if one was attached
- **Timestamp**: When the thread was created

### New Reply
- **Title**: "💬 [Thread Title]" (clickable link to the thread)
- **Board**: Which board the thread is in
- **Replied by**: Username or "Anonymous"
- **Description**: Preview of the reply content (up to 400 characters)
- **Image**: Reply image if one was attached
- **Timestamp**: When the reply was posted

## Important Features

- **No Mentions**: The bot is configured to NEVER mention @everyone, @here, or any roles/users
- **Clean Embeds**: Rich Discord embeds with proper formatting
- **Image Support**: Automatically includes images from threads and replies
- **Direct Links**: Click the title to go straight to the thread

## Troubleshooting

### Bot not receiving notifications?

1. Check that both the bot and Next.js app are running
2. Verify \`WEBHOOK_SECRET\` matches in both processes
3. Check \`BOT_WEBHOOK_URL\` is correct (use localhost for local dev)
4. Look for errors in the bot console

### Notifications not appearing in Discord?

1. Verify \`DISCORD_GENERAL_CHANNEL_ID\` is correct
2. Ensure the bot has permission to send messages in that channel
3. Check the bot console for error messages

### Check bot health

Visit \`http://localhost:3001/health\` to see bot status:

\`\`\`json
{
  "status": "ok",
  "bot": "connected",
  "uptime": 123.456
}
\`\`\`

## Production Deployment

For production (e.g., Railway, Heroku):

1. Deploy your bot as a separate service
2. Update \`BOT_WEBHOOK_URL\` to the bot's public URL
3. Ensure both services can communicate (same network or public URLs)
4. Use the same \`WEBHOOK_SECRET\` in both services

## Example Notification

When someone posts a thread titled "Looking for team members" in the "General" board:

```
🧵 Looking for team members
━━━━━━━━━━━━━━━━━━━━━━
Board: General    Author: BearDAO

Hey everyone! I'm working on a cool project and looking for...

[Image if attached]

🕐 Just now
```
