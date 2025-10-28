require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('ready', async () => {
  console.log(`\n🤖 Logged in as: ${client.user.tag}\n`);
  console.log(`📊 Currently in ${client.guilds.cache.size} servers:\n`);

  // List all guilds first
  client.guilds.cache.forEach(guild => {
    console.log(`  - ${guild.name} (${guild.id})`);
  });

  console.log('\n⚠️  Making bot leave all servers...\n');

  // Leave all guilds
  for (const [guildId, guild] of client.guilds.cache) {
    try {
      console.log(`👋 Leaving: ${guild.name}`);
      await guild.leave();
      console.log(`✅ Successfully left: ${guild.name}\n`);
    } catch (error) {
      console.error(`❌ Failed to leave ${guild.name}:`, error.message);
    }
  }

  console.log('✅ Bot has left all servers!');
  console.log('\n📌 Next steps:');
  console.log('1. Re-invite the bot with proper permissions');
  console.log('2. Use this invite URL with correct permissions:\n');
  console.log(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=16&scope=bot%20applications.commands\n`);

  process.exit(0);
});

client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
  process.exit(1);
});

console.log('🔄 Connecting to Discord...');
client.login(process.env.DISCORD_BOT_TOKEN)
  .catch(error => {
    console.error('❌ Failed to login:', error);
    process.exit(1);
  });
