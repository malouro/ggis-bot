const { Collection } = require('discord.js');
const waitForExpect = require('wait-for-expect');
const defaultSettings = require('../settings.example.json');

exports.MOCK_GUILD_ID = 'MOCK_GUILD_ID';
exports.MOCK_CHANNEL_ID = '987654321';
exports.MOCK_USER_ID = '123456789';

exports.MOCK_GUILD = {
  id: this.MOCK_GUILD_ID,
};
exports.MOCK_CHANNEL = {
  id: this.MOCK_CHANNEL_ID,
};
exports.MOCK_USER = {
  id: this.MOCK_USER_ID,
};

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
  guilds: {
    cache: new Collection([
      [this.MOCK_GUILD_ID, this.MOCK_GUILD],
    ]),
  },
  channels: {
    cache: new Collection([
      [this.MOCK_CHANNEL_ID, this.MOCK_CHANNEL],
    ]),
  },
  users: {
    cache: new Collection([
      [this.MOCK_USER_ID, this.MOCK_USER],
    ]),
  },
  guildOverrides: {},
};

exports.makeMockMessage = (args, mockBot = this.MOCK_BOT) => ({
  ...mockBot.message,
  content: args.join(' '),
});

exports.checkBotIsSetup = async (timeout = 10000) => {
  await waitForExpect(() => {
    expect(global.BOT_SETUP_DONE).toBe(true);
  }, timeout);
};

exports.settings = {
  ...defaultSettings,
  token: process.env.TOKEN,
  prefix: '!',
  masterID: process.env.MASTER_ID,
  mainGuild: process.env.TEST_GUILD,
  testGuild: process.env.TEST_GUILD,
  mainChannel: process.env.TEST_CHANNEL,
  streamlink: {
    no_init: true,
  },
};
