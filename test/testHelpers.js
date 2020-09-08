const defaultSettings = require('../settings.example.json');

exports.MOCK_GUILD_ID = 'MOCK_GUILD_ID';
exports.MOCK_CHANNEL_ID = 'MOCK_CHANNEL_ID';
exports.MOCK_BOT = {
  clearMocks: () => {
    this.MOCK_BOT.message.reply.mockClear();
    this.MOCK_BOT.message.channel.send.mockClear();
  },
  prefix: '!',
  message: {
    reply: jest.fn(console.log),
    channel: {
      send: jest.fn(),
      id: this.MOCK_CHANNEL_ID,
    },
    guild: {
      id: this.MOCK_GUILD_ID,
    },
  },
  guildOverrides: {},
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
