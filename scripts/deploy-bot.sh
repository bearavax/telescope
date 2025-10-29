#!/bin/bash

# Railway Bot Deployment Script
# This script helps you deploy the Discord bot to Railway

echo "🚀 Telescope Discord Bot - Railway Deployment"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Deploy the bot service
echo -e "${BLUE}Step 1: Deploying bot service...${NC}"
echo "Run: railway service"
echo "Select: bot"
echo "Then run: railway up"
echo ""
read -p "Press enter when bot is deployed..."

# Step 2: Get bot URL
echo ""
echo -e "${BLUE}Step 2: Getting bot URL...${NC}"
echo "The bot should now be running. Let's get its URL."
echo "Make sure you have the 'bot' service selected."
echo ""
echo "Run: railway domain"
echo ""
read -p "Enter your bot's Railway URL (e.g., https://bot-production-xxxx.up.railway.app): " BOT_URL

# Validate URL
if [[ ! $BOT_URL =~ ^https:// ]]; then
    echo -e "${YELLOW}Warning: URL should start with https://${NC}"
    read -p "Are you sure this is correct? (y/n): " confirm
    if [[ $confirm != "y" ]]; then
        echo "Exiting. Please run the script again."
        exit 1
    fi
fi

# Step 3: Set environment variables for bot service
echo ""
echo -e "${BLUE}Step 3: Setting bot service environment variables...${NC}"
echo "Make sure 'bot' service is selected!"
echo ""
echo "Run these commands:"
echo ""
echo "railway variables set DISCORD_BOT_TOKEN=\"YOUR_DISCORD_BOT_TOKEN_HERE\""
echo "railway variables set DISCORD_GENERAL_CHANNEL_ID=\"881074608537763904\""
echo "railway variables set WEBHOOK_SECRET=\"e64b619ba92a7ab15081ec4a0f63c23c0bc39c7d187262b12858581afe7723a8\""
echo "railway variables set BOT_PORT=\"3001\""
echo ""
read -p "Press enter when bot variables are set..."

# Step 4: Set environment variables for Next.js service
echo ""
echo -e "${BLUE}Step 4: Setting Next.js app environment variables...${NC}"
echo "Now switch to your MAIN Next.js service!"
echo ""
echo "Run: railway service"
echo "Select: Your main Next.js service (NOT bot)"
echo ""
read -p "Press enter when you've switched services..."

echo ""
echo "Now run these commands:"
echo ""
echo "railway variables set BOT_WEBHOOK_URL=\"$BOT_URL\""
echo "railway variables set WEBHOOK_SECRET=\"e64b619ba92a7ab15081ec4a0f63c23c0bc39c7d187262b12858581afe7723a8\""
echo ""
read -p "Press enter when Next.js variables are set..."

# Step 5: Verify
echo ""
echo -e "${GREEN}✅ Configuration complete!${NC}"
echo ""
echo "To verify everything is working:"
echo "1. Visit: $BOT_URL/health"
echo "   Should show: {\"status\": \"ok\", \"bot\": \"connected\"}"
echo ""
echo "2. Create a test forum post on your site"
echo "3. Check Discord channel ID: 881074608537763904"
echo ""
echo -e "${YELLOW}If you need to check logs:${NC}"
echo "  railway service (select bot) → railway logs"
echo ""
