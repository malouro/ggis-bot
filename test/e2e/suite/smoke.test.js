const { Client } = require('discord.js');
const waitForExpect = require('wait-for-expect');
const setupBot = require('../../../handlers/Setup');
const { settings, checkBotIsSetup } = require('../../testHelpers');
const { getGuildCommandPrefix } = require('../../../handlers/GuildSettings');

jest.setTimeout(30000);

const Ggis = new Client();

describe('Smoke Tests', () => {
  beforeAll(async () => {
    /* Setup bot */
    await setupBot(Ggis, settings);
    await checkBotIsSetup();

    /* Login */
    await Ggis.login(settings.token);
    await waitForExpect(() => {
      expect(Ggis.ws.status).toBe(0);
    });
  });

  afterAll(async () => {
    await Ggis.destroy();
    await waitForExpect(() => {
      expect(global.ALL_CLEAR).toBe(true);
    });
  });

  test('bot should log in successfully', () => {
    expect(Ggis.ws.status).toBe(0);
    expect(Ggis.guilds.cache.has(process.env.TEST_GUILD)).toBe(true);
  });

  test('ping command works', async (done) => {
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
      done();
    });
  });
});
