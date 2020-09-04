const fs = require('fs');
const path = require('path');

const guildConfigsPath = path.join(__dirname, '../config/guilds');

exports.init = () => {
  const guildOverrides = {};

  fs.readdir(guildConfigsPath, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
      if (file.endsWith('.json')) {
        const guildId = file.slice(0, file.length - 5);
        const guildConfig = JSON.parse(fs.readFileSync(path.resolve(guildConfigsPath, `./${file}`), 'utf-8'));

        guildOverrides[guildId] = guildConfig;
      }
    });
  });

  return guildOverrides;
};

exports.getGuildCommandPrefix = (bot, message) => {
  let id = null;

  if (message && message.guild) {
    ({ id } = message.guild);
  }
  if (id) {
    if (bot.guildOverrides[id] && bot.guildOverrides[id].prefix) {
      return bot.guildOverrides[id].prefix;
    }
  }

  return bot.prefix;
};

// exports.update = (bot, id, key, value) => {
// };
