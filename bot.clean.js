require('dotenv').config();
const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');
const express = require('express');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildScheduledEvents,
  ],
});

// Express server for webhook
const app = express();
app.use(express.json());

const GENERAL_CHANNEL_ID = process.env.DISCORD_GENERAL_CHANNEL_ID;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const PORT = process.env.BOT_PORT || 3001;

client.once(Events.ClientReady, (readyClient) => {
  console.log('Discord Bot is now ONLINE!');
  console.log('Logged in as: ' + readyClient.user.tag);
  console.log('Bot ID: ' + readyClient.user.id);
  console.log('In ' + readyClient.guilds.cache.size + ' servers');

  // List all guilds
  console.log('Servers:');
  readyClient.guilds.cache.forEach(guild => {
    console.log('  - ' + guild.name + ' (' + guild.id + ')');
  });

  console.log('Watching for scheduled events and forum activity...');

  if (GENERAL_CHANNEL_ID) {
    console.log('Forum notifications will be posted to channel: ' + GENERAL_CHANNEL_ID);
  } else {
    console.warn('DISCORD_GENERAL_CHANNEL_ID not set - forum notifications disabled');
  }
});

// Listen for scheduled events being created
client.on(Events.GuildScheduledEventCreate, (event) => {
  console.log('New Event Created:');
  console.log('   Name: ' + event.name);
  console.log('   Guild: ' + event.guild.name);
  console.log('   Start: ' + event.scheduledStartAt);
  console.log('   Description: ' + (event.description || 'No description'));
});

// Listen for scheduled events being updated
client.on(Events.GuildScheduledEventUpdate, (oldEvent, newEvent) => {
  console.log('Event Updated:');
  console.log('   Name: ' + newEvent.name);
  console.log('   Guild: ' + newEvent.guild.name);
});

// Listen for scheduled events being deleted
client.on(Events.GuildScheduledEventDelete, (event) => {
  console.log('Event Deleted:');
  console.log('   Name: ' + event.name);
  console.log('   Guild: ' + event.guild.name);
});

// Error handling
client.on(Events.Error, (error) => {
  console.error('Discord client error:', error);
});

// Webhook endpoint for forum thread notifications
app.post('/webhook/forum-activity', async (req, res) => {
  try {
    // Verify webhook secret
    const authHeader = req.headers.authorization;
    if (!WEBHOOK_SECRET || authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      console.warn('Unauthorized webhook attempt');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, data } = req.body;

    if (!GENERAL_CHANNEL_ID) {
      return res.status(400).json({ error: 'General channel not configured' });
    }

    const channel = await client.channels.fetch(GENERAL_CHANNEL_ID);
    if (!channel || !channel.isTextBased()) {
      return res.status(400).json({ error: 'Invalid channel' });
    }

    // Handle different activity types
    if (type === 'new_thread') {
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(data.title || 'Untitled Thread')
        .setURL(data.url)
        .addFields(
          { name: 'Board', value: data.boardName, inline: true },
          { name: 'Author', value: data.anonymous ? 'Anonymous' : (data.username || 'Anonymous'), inline: true }
        )
        .setTimestamp();

      // Add preview text if available
      if (data.preview) {
        const previewText = data.preview.substring(0, 400);
        embed.setDescription(previewText + (data.preview.length > 400 ? '...' : ''));
      }

      // Add image if available
      if (data.imageUrl) {
        embed.setImage(data.imageUrl);
      }

      // Send with mentions disabled
      await channel.send({ 
        embeds: [embed],
        allowedMentions: { parse: [] }
      });
      
      console.log('Posted new thread: ' + data.title);
    } else if (type === 'new_reply') {
      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle(data.threadTitle || 'Thread')
        .setURL(data.url)
        .addFields(
          { name: 'Board', value: data.boardName, inline: true },
          { name: 'Replied by', value: data.anonymous ? 'Anonymous' : (data.username || 'Anonymous'), inline: true }
        )
        .setTimestamp();

      // Add reply text if available
      if (data.preview) {
        const previewText = data.preview.substring(0, 400);
        embed.setDescription(previewText + (data.preview.length > 400 ? '...' : ''));
      }

      // Add image if available
      if (data.imageUrl) {
        embed.setImage(data.imageUrl);
      }

      // Send with mentions disabled
      await channel.send({ 
        embeds: [embed],
        allowedMentions: { parse: [] }
      });
      
      console.log('Posted reply notification for: ' + data.threadTitle);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    bot: client.isReady() ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// Start express server
app.listen(PORT, () => {
  console.log('Webhook server listening on port ' + PORT);
});

// Login to Discord
console.log('Starting Discord bot...');
client.login(process.env.DISCORD_BOT_TOKEN)
  .catch(error => {
    console.error('Failed to login:', error);
    process.exit(1);
  });