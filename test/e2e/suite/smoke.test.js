const { Client } = require('discord.js');
const fs = require('fs');
const waitForExpect = require('wait-for-expect');
const setupBot = require('../../../handlers/Setup');
const { settings } = require('../testHelpers');
const { platforms } = require('../../../config/lfg/platforms.json');

jest.setTimeout(30000);

const Ggis = new Client();

describe('Smoke Tests', () => {
  beforeAll(async () => {
    /* Setup bot */
    const numberOfExpectedCommands = 29;
    const lfgGames = fs.readdirSync('./config/lfg/default');

    await setupBot(Ggis, settings);
    await waitForExpect(() => {
      expect(Ggis.games.size).toBe(lfgGames.length);
      expect(Ggis.commands.size).toBe(numberOfExpectedCommands);
      expect(Ggis.platforms.size).toBe(platforms.length);
    }, 10000);

    /* Login */
    await Ggis.login(settings.token);
    await waitForExpect(() => {
      expect(Ggis.status).toBe(0);
    });
  });

  afterAll(async () => {
    await Ggis.destroy();
    await waitForExpect(() => {
      expect(Ggis.status).toBe(5);
      expect(global.ALL_CLEAR).toBe(true);
    });
  });

  test('bot should log in successfully', () => {
    expect(Ggis.status).toBe(0);
    expect(Ggis.guilds.has(process.env.TEST_GUILD)).toBe(true);
  });

  test('ping command', async () => {
    const clearedUp = [false, false];
    const commandToTry = `${settings.prefix}ping`;
    const channelToTestIn = Ggis.channels.get(
      process.env.TEST_CHANNEL,
    );

    Ggis.on('message', (message) => {
      if (/Pong!/.test(message.content)) {
        message.delete().then(() => {
          clearedUp[1] = true;
        });
      }
    });

    channelToTestIn.send(commandToTry).then((message) => {
      message
        .delete()
        .then(() => {
          clearedUp[0] = true;
        })
        .catch((errorDeletingCommand) => {
          throw new Error(errorDeletingCommand);
        });
    });

    await waitForExpect(() => {
      expect(clearedUp).toStrictEqual([true, true]);
    });
  });
});
