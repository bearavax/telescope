// Cleaned Discord bot implementation (ASCII-only logs)
// This file replaces the previous bot.js which was corrupted during iterative edits.

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GENERAL_CHANNEL_ID = process.env.DISCORD_GENERAL_CHANNEL_ID;
const BOT_PORT = process.env.BOT_PORT || 3001;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'change-me';

if (!DISCORD_BOT_TOKEN || !DISCORD_GENERAL_CHANNEL_ID) {
  console.error('Missing required environment variables: DISCORD_BOT_TOKEN or DISCORD_GENERAL_CHANNEL_ID');
  // Not exiting so the file can be linted/checked in CI without secrets.
}

// Create Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once(Events.ClientReady, () => {
  console.log('Discord client ready');
});

client.on('error', (err) => {
  console.error('Discord client error:', err && err.stack ? err.stack : err);
});

// Start Express webhook server
const app = express();
app.use(bodyParser.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/webhook/forum-activity', async (req, res) => {
  try {
    const secret = req.headers['x-webhook-secret'] || req.headers['x-webhook-secret'.toLowerCase()];
    if (!secret || secret !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = req.body;
    if (!payload || !payload.type || !payload.data) {
      return res.status(400).json({ error: 'Bad payload' });
    }

    const channel = await client.channels.fetch(DISCORD_GENERAL_CHANNEL_ID).catch(() => null);
    if (!channel) {
      console.error('Cannot find channel with ID', DISCORD_GENERAL_CHANNEL_ID);
      return res.status(500).json({ error: 'Channel not found' });
    }

    // Build a simple embed message
    const data = payload.data;
    const embed = new EmbedBuilder()
      .setTitle('Forum activity')
      .setDescription(typeof data === 'string' ? data.slice(0, 2000) : JSON.stringify(data).slice(0, 2000))
      .setTimestamp(new Date());

    await channel.send({ embeds: [embed], allowedMentions: { parse: [] } });

    return res.json({ ok: true });
  } catch (err) {
    console.error('Error handling webhook:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const server = app.listen(BOT_PORT, () => {
  console.log('Bot webhook listening on port', BOT_PORT);
});

// Login the Discord client
client.login(DISCORD_BOT_TOKEN).catch((err) => {
  console.error('Failed to login Discord client:', err && err.stack ? err.stack : err);
});

// Graceful shutdown
function shutdown() {
  console.log('Shutting down bot...');
  server.close(() => {
    try { client.destroy(); } catch (e) { /* ignore */ }
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
