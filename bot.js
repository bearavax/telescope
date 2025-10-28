require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildScheduledEvents,
  ],
});

async function checkUpcomingEvents() {
  console.log('\n🔍 Checking for upcoming events...');
  const now = new Date();

  let totalEvents = 0;

  for (const guild of client.guilds.cache.values()) {
    try {
      const events = await guild.scheduledEvents.fetch();
      const upcomingEvents = events.filter(event => {
        const startTime = new Date(event.scheduledStartAt);
        return startTime >= now;
      });

      if (upcomingEvents.size > 0) {
        console.log('\n📅 Guild: ' + guild.name);
        upcomingEvents.forEach(event => {
          console.log('   • ' + event.name);
          console.log('     Start: ' + event.scheduledStartAt.toLocaleString());
          console.log('     Status: ' + event.status);
          if (event.description) {
            console.log('     Description: ' + event.description);
          }
        });
        totalEvents += upcomingEvents.size;
      }
    } catch (error) {
      console.error('❌ Error fetching events for ' + guild.name + ':', error.message);
    }
  }

  if (totalEvents === 0) {
    console.log('   No upcoming events found');
  } else {
    console.log('\n✅ Found ' + totalEvents + ' upcoming event(s)');
  }
}

client.once(Events.ClientReady, (readyClient) => {
  console.log('\n✅ Discord Bot is now ONLINE\!');
  console.log('🤖 Logged in as: ' + readyClient.user.tag);
  console.log('📊 Bot ID: ' + readyClient.user.id);
  console.log('🏠 In ' + readyClient.guilds.cache.size + ' servers\n');

  console.log('Servers:');
  readyClient.guilds.cache.forEach(guild => {
    console.log('  - ' + guild.name + ' (' + guild.id + ')');
  });

  console.log('\n👀 Watching for scheduled events...\n');

  checkUpcomingEvents();

  setInterval(checkUpcomingEvents, 60 * 1000);
  console.log('⏰ Event check scheduled every 1 minute\n');
});

client.on(Events.GuildScheduledEventCreate, (event) => {
  console.log('\n📅 New Event Created:');
  console.log('   Name: ' + event.name);
  console.log('   Guild: ' + event.guild.name);
  console.log('   Start: ' + event.scheduledStartAt);
  console.log('   Description: ' + (event.description || 'No description'));
});

client.on(Events.GuildScheduledEventUpdate, (oldEvent, newEvent) => {
  console.log('\n📝 Event Updated:');
  console.log('   Name: ' + newEvent.name);
  console.log('   Guild: ' + newEvent.guild.name);
});

client.on(Events.GuildScheduledEventDelete, (event) => {
  console.log('\n🗑️  Event Deleted:');
  console.log('   Name: ' + event.name);
  console.log('   Guild: ' + event.guild.name);
});

client.on(Events.Error, (error) => {
  console.error('❌ Discord client error:', error);
});

console.log('🔄 Starting Discord bot...');
client.login(process.env.DISCORD_BOT_TOKEN)
  .catch(error => {
    console.error('❌ Failed to login:', error);
    process.exit(1);
  });
