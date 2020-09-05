const settingsCommand = require('../../../commands/Useful/settings');
const { MOCK_BOT, makeMockMessage } = require('../../testHelpers');

describe('Settings command', () => {
  test('!settings list', async () => {
    const fullArgs = ['!settings', 'list'];
    await settingsCommand.run(MOCK_BOT, makeMockMessage(fullArgs), fullArgs);

    expect(MOCK_BOT.message.reply).toHaveBeenCalledWith(expect.stringContaining('=== Scope: "bot" ==='));
  });
});
