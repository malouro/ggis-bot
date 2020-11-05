const { Client } = require('discord.js');
const fs = require('fs');
const waitForExpect = require('wait-for-expect');
const setupBot = require('../../../handlers/Setup');
const { settings, numberOfCommands } = require('../../testHelpers');
const { platforms } = require('../../../config/lfg/platforms.json');
const { getGuildCommandPrefix } = require('../../../handlers/GuildSettings');

jest.setTimeout(30000);

const Ggis = new Client();

describe('Smoke Tests', () => {
  let online = false;

  beforeAll(async () => {
    /* Setup bot */
    const lfgGames = fs.readdirSync('./config/lfg/default');

    await setupBot(Ggis, settings);

    Ggis.on('ready', () => { online = true; });
    Ggis.on('disconnect', () => { online = false; });

    await waitForExpect(() => {
      expect(Ggis.games.size).toBe(lfgGames.length);
      expect(Ggis.commands.size).toBe(numberOfCommands);
      expect(Ggis.platforms.size).toBe(platforms.length);
    }, 10000);

    /* Login */
    await Ggis.login(settings.token);
    await waitForExpect(() => {
      expect(online).toBe(true);
    });
  });

  afterAll(async () => {
    await Ggis.destroy();
    await waitForExpect(() => {
      expect(online).toBe(false);
      expect(global.ALL_CLEAR).toBe(true);
    });
  });

  test('bot should log in successfully', () => {
    expect(Ggis.guilds.cache.has(process.env.TEST_GUILD)).toBe(true);
  });

  test('ping command', async () => {
    const clearedUp = [false, false];
    const channelToTestIn = Ggis.guilds.cache.get(
      process.env.TEST_GUILD,
    ).channels.cache.get(
      process.env.TEST_CHANNEL,
    );
    const commandToTry = `${getGuildCommandPrefix(Ggis, channelToTestIn)}ping`;

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
