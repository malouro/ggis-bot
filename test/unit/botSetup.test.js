const mockConsole = require('jest-mock-console').default;
const { Collection } = require('discord.js');
const Setup = require('../../handlers/Setup');
const { checkBotIsSetup } = require('../testHelpers');

const settings = {
  botName: 'ggis',
  botNameProper: 'Ggis',
  token: 'fake-token',
  prefix: '!',
  commandGroups: [
    {
      code: [
        'debug',
        'support',
      ],
      name: 'Debug & Support',
      description: 'Help menus & debug',
    },
    {
      code: [
        'useful',
      ],
      name: 'Useful',
      description: 'Commands that do useful things',
    },
    {
      code: [
        'random',
        'rng',
      ],
      name: 'Random',
      description: 'Random, fun commands',
    },
    {
      code: [
        'memes',
      ],
      name: 'Memes',
      description: 'Memes & dreams',
    },
  ],
  streamlink: {
    no_init: true,
  },
};

const bot = {
  on: jest.fn(),
};

jest.mock('twitchps');

describe('Bot Setup', () => {
  const restoreConsole = mockConsole();

  /* Wait for setup to be done */
  beforeAll(async () => {
    await Setup(bot, settings);
    await checkBotIsSetup();
  }, 20000);

  afterAll(() => {
    jest.clearAllMocks();
    restoreConsole();
  });

  describe('Setup Handler', () => {
    test('initializes necessary bot properties', () => {
      expect(bot.commandGroups).toBeInstanceOf(Collection);
      expect(bot.commandGroupCategories).toBeInstanceOf(Collection);
      expect(bot.commands).toBeInstanceOf(Collection);
      expect(bot.aliases).toBeInstanceOf(Collection);
    });
  });

  describe('Event Loader', () => {
    test('loads event handlers', () => {
      expect(bot.on).toHaveBeenCalledTimes(9);
    });
  });
});
