const fs = require('fs');
const path = require('path');
const waitForExpect = require('wait-for-expect');
const settingsCommand = require('../../../commands/Useful/settings');
const { MOCK_BOT, MOCK_GUILD_ID, makeMockMessage } = require('../../testHelpers');

const pathToMockGuildConfig = path.resolve(__dirname, `../../../config/guilds/${MOCK_GUILD_ID}.json`);

describe('Settings command', () => {
  afterEach(async () => {
    const guildConfigExists = () => fs.existsSync(pathToMockGuildConfig);

    MOCK_BOT.clearMocks();

    if (guildConfigExists()) {
      fs.unlinkSync(pathToMockGuildConfig);
      await waitForExpect(() => {
        expect(guildConfigExists()).toBe(false);
      });
    }
  });

  test('shows full list of settings that can be configured/overridden', async () => {
    const args = ['!settings', 'list'];
    await settingsCommand.run(MOCK_BOT, makeMockMessage(args), args);

    expect(MOCK_BOT.message.reply).toHaveBeenCalledWith(expect.stringContaining('=== Scope: "bot" ==='));
  });

  test('shows current server\'s config overrides', async () => {
    const args = ['!settings', 'show'];
    await settingsCommand.run(MOCK_BOT, makeMockMessage(args), args);

    expect(MOCK_BOT.message.reply).toHaveBeenCalledWith(expect.stringContaining('No setting overrides for this server.'));
  });

  test('sets a server-specific command prefix', async () => {
    const newPrefix = '@@';

    /* Set prefix */
    const argsToChangePrefix = ['!settings', 'bot', 'prefix', newPrefix];
    await settingsCommand.run(MOCK_BOT, makeMockMessage(argsToChangePrefix), argsToChangePrefix);

    /* Check prefix with `!settings show` */
    const argsToCheckPrefix = ['!settings', 'show'];
    await settingsCommand.run(MOCK_BOT, makeMockMessage(argsToCheckPrefix), argsToCheckPrefix);
    expect(MOCK_BOT.message.reply).toHaveBeenCalledWith(expect.stringContaining(`"bot": { "prefix": "${newPrefix}" }`));
  });
});
