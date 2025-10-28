require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildScheduledEvents,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log('\n✅ Discord Bot is now ONLINE!');
  console.log(`🤖 Logged in as: ${readyClient.user.tag}`);
  console.log(`📊 Bot ID: ${readyClient.user.id}`);
  console.log(`🏠 In ${readyClient.guilds.cache.size} servers\n`);

  // List all guilds
  console.log('Servers:');
  readyClient.guilds.cache.forEach(guild => {
    console.log(`  - ${guild.name} (${guild.id})`);
  });

  console.log('\n👀 Watching for scheduled events...\n');
});

// Listen for scheduled events being created
client.on(Events.GuildScheduledEventCreate, (event) => {
  console.log('📅 New Event Created:');
  console.log(`   Name: ${event.name}`);
  console.log(`   Guild: ${event.guild.name}`);
  console.log(`   Start: ${event.scheduledStartAt}`);
  console.log(`   Description: ${event.description || 'No description'}`);
});

// Listen for scheduled events being updated
client.on(Events.GuildScheduledEventUpdate, (oldEvent, newEvent) => {
  console.log('📝 Event Updated:');
  console.log(`   Name: ${newEvent.name}`);
  console.log(`   Guild: ${newEvent.guild.name}`);
});

// Listen for scheduled events being deleted
client.on(Events.GuildScheduledEventDelete, (event) => {
  console.log('🗑️  Event Deleted:');
  console.log(`   Name: ${event.name}`);
  console.log(`   Guild: ${event.guild.name}`);
});

// Error handling
client.on(Events.Error, (error) => {
  console.error('❌ Discord client error:', error);
});

// Login to Discord
console.log('🔄 Starting Discord bot...');
client.login(process.env.DISCORD_BOT_TOKEN)
  .catch(error => {
    console.error('❌ Failed to login:', error);
    process.exit(1);
  });
