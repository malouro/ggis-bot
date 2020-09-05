const defaultSettings = require('../settings.example.json');

exports.MOCK_BOT = {
  prefix: '!',
  message: {
    reply: jest.fn(console.log),
    channel: {
      send: jest.fn(),
      id: 'MOCK_CHANNEL_ID',
    },
    guild: {
      id: 'MOCK_GUILD_ID',
    },
  },
  guildOverrides: {
    MOCK_GUILD_ID: {},
  },
};

exports.numberOfCommands = 30;

exports.makeMockMessage = (args, mockBot = this.MOCK_BOT) => ({
  ...mockBot.message,
  content: args.join(' '),
});

exports.settings = {
  ...defaultSettings,
  token: process.env.TOKEN,
  prefix: '!',
  masterID: process.env.MASTER_ID,
  mainGuild: process.env.TEST_GUILD,
  testGuild: process.env.TEST_GUILD,
  mainChannel: process.env.TEST_CHANNEL,
};
