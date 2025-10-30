// Test setup file
process.env.DISCORD_BOT_TOKEN = 'test-token';
process.env.DISCORD_GENERAL_CHANNEL_ID = 'test-channel';
process.env.WEBHOOK_SECRET = 'test-secret';
process.env.BOT_PORT = '3001';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};