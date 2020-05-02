const fs = require('fs');
const waitForExpect = require('wait-for-expect');
const mockConsole = require('jest-mock-console').default;
const { Collection } = require('discord.js');
const Setup = require('../../handlers/Setup');
const { platforms } = require('../../config/lfg/platforms.json');

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
};

const bot = {
  on: jest.fn(),
};

jest.mock('twitchps');

describe('Handlers', () => {
  const restoreConsole = mockConsole();

  /* Wait for setup to be done */
  beforeAll(async () => {
    const numberOfExpectedCommands = 29;
    const lfgGames = fs.readdirSync('./config/lfg/default');
    await Setup(bot, settings);

    await waitForExpect(() => {
      expect(bot.games.size).toBe(lfgGames.length);
      expect(bot.commands.size).toBe(numberOfExpectedCommands);
      expect(bot.platforms.size).toBe(platforms.length);
    }, 10000);
  }, 20000);

  afterAll(() => restoreConsole());

  describe('Bot setup', () => {
    test('initializes necessary bot properties', () => {
      expect(bot.commandGroups).toBeInstanceOf(Collection);
      expect(bot.commandGroupCategories).toBeInstanceOf(Collection);
      expect(bot.commands).toBeInstanceOf(Collection);
      expect(bot.aliases).toBeInstanceOf(Collection);
    });
  });

  describe('Event Loader', () => {
    test('loads event handlers', () => {
      expect(bot.on).toHaveBeenCalledTimes(11);
    });
  });
});
