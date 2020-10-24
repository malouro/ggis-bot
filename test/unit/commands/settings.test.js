const fs = require('fs');
const path = require('path');
const waitForExpect = require('wait-for-expect');
const settingsCommand = require('../../../commands/Useful/settings');
const {
  MOCK_BOT, MOCK_GUILD_ID, MOCK_CHANNEL_ID, MOCK_USER_ID, makeMockMessage,
} = require('../../testHelpers');
const { serverSettings: testServerSettings } = require('../../data');

const pathToMockGuildConfig = path.resolve(__dirname, `../../../config/guilds/${MOCK_GUILD_ID}.json`);

const guildConfigExists = () => fs.existsSync(pathToMockGuildConfig);

beforeEach(async () => {
  if (guildConfigExists()) {
    fs.unlinkSync(pathToMockGuildConfig);
    await waitForExpect(() => {
      expect(guildConfigExists()).toBe(false);
    });
  }
});

afterEach(() => MOCK_BOT.clearMocks());

describe('Settings Command', () => {
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

    await waitForExpect(() => {
      expect(
        fs.readFileSync(`./config/guilds/${MOCK_GUILD_ID}.json`, 'utf-8'),
      ).toMatch(new RegExp(`"prefix":\\s*"${newPrefix}"`));
    });

    /* Check prefix with `!settings show` */
    const argsToCheckPrefix = ['@@settings', 'show'];
    await settingsCommand.run(MOCK_BOT, makeMockMessage(argsToCheckPrefix), argsToCheckPrefix);
    expect(MOCK_BOT.message.reply).toHaveBeenCalledWith(expect.stringContaining(`"bot": { "prefix": "${newPrefix}" }`));
  });

  test.each([
    ['string', ['test-value'], '"test-value"'],
    ['number', ['10.5'], 10.5],
    ['integer', ['10'], 10],
    ['boolean', ['true'], true],
    ['boolean', ['false'], false],
    ['range', ['0'], 0],
    ['range', ['5'], 5],
    ['range', ['10'], 10],
    ['textChannel', [`<#${MOCK_CHANNEL_ID}>`], `"${MOCK_CHANNEL_ID}"`],
    ['user', [`<!@${MOCK_USER_ID}>`], `"${MOCK_USER_ID}"`],
    ['arrayOfStrings', ['one', 'two'], '\\[\\s*"one",\\s*"two"\\s*\\]'],
    ['arrayOfStrings', ['1337', '12345678900987654321'], '\\[\\s*"1337",\\s*"12345678900987654321"\\s*\\]'],
    ['arrayOfNumbers', ['1', '2', '3'], '\\[\\s*1,\\s*2,\\s*3\\s*\\]'],
    ['arrayOfBooleans', ['true', 'false'], '\\[\\s*true,\\s*false\\s*\\]'],
    ['arrayOfRanges', ['1', '5', '10'], '\\[\\s*1,\\s*5,\\s*10\\s*\\]'],
    ['arrayOfTextChannels', [`<#${MOCK_CHANNEL_ID}>`], `\\[\\s*"${MOCK_CHANNEL_ID}"\\s*\\]`],
    ['arrayOfUsers', [`<!@${MOCK_USER_ID}>`], `\\[\\s*"${MOCK_USER_ID}"\\s*\\]`],
  ])('setting of type `%s` with input "%s" sets to correct value successfully`', async (type, value, expectation) => {
    const args = ['!settings', 'test', type, ...value];

    await settingsCommand.run(MOCK_BOT, makeMockMessage(args), args);
    expect(MOCK_BOT.message.reply).toHaveBeenCalledWith(expect.stringMatching(new RegExp(`"${type}":\\s*${expectation}`)));
  });

  test.each([
    ['number', ['foo']],
    ['integer', ['10.5']],
    ['boolean', ['not-boolean']],
    ['range', ['-1']],
    ['range', ['11']],
    ['textChannel', ['#not-really-a-text-channel']],
    ['textChannel', ['<#999999999>']],
    ['user', ['@NotAUser']],
    ['user', ['<!@999999999>']],
    ['arrayOfNumbers', ['not', 'numbers']],
    ['arrayOfBooleans', ['not', 'booleans']],
    ['arrayOfRanges', ['not', 'in', 'range']],
    ['arrayOfRanges', ['-1']],
  ])('setting of type `%s` with input "%s" fails expectedly', async (type, value) => {
    const args = ['!settings', 'test', type, ...value];

    await settingsCommand.run(MOCK_BOT, makeMockMessage(args), args);
    expect(MOCK_BOT.message.reply).toHaveBeenCalledWith(
      expect.stringMatching(`\`${value}\` is not a valid value. Expected type of \`${testServerSettings.test[type].type}\``),
    );
  });
});
