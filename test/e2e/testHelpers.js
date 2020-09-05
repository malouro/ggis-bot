const defaultSettings = require('../../settings.example.json');

exports.numberOfCommands = 30;
exports.settings = {
  ...defaultSettings,
  token: process.env.TOKEN,
  prefix: '!',
  masterID: process.env.MASTER_ID,
  mainGuild: process.env.TEST_GUILD,
  testGuild: process.env.TEST_GUILD,
  mainChannel: process.env.TEST_CHANNEL,
};
