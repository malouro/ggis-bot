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

exports.makeMockMessage = (args, mockBot = this.MOCK_BOT) => ({
  ...mockBot.message,
  content: args.join(' '),
});
