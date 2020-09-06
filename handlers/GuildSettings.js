const fs = require('fs');
const path = require('path');
const merge = require('lodash.merge');
const settings = require('../settings.json');

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

exports.getGuildSpecificSetting = (bot, message, scope, key, defaultSetting) => {
  let id = null;

  if (message && message.guild) {
    ({ id } = message.guild);
  }
  if (id) {
    if (
      bot.guildOverrides[id]
      && bot.guildOverrides[id][scope]
      && bot.guildOverrides[id][scope][key]
    ) {
      return bot.guildOverrides[id].bot.prefix;
    }
  }

  return defaultSetting || (scope === 'bot' ? settings.key : settings.scope.key);
};

exports.getGuildCommandPrefix = (bot, message) => this.getGuildSpecificSetting(bot, message, 'bot', 'prefix', bot.prefix);

/**
 * Sets or updates the given value within the server's settings
 * @param {Discord.Client} bot The bot instance
 * @param {import('discord.js').Snowflake} id ID of the Guild
 * @param {string} scope <scope> in settings
 * @param {string} key <key> in <scope>
 * @param {any} value <value> to set <scope.key> to for the given guild
 * @returns {Promise} result
 */
exports.update = (bot, id, scope, key, value) => new Promise((resolve, reject) => {
  let config = {};

  if (bot.guildOverrides[id]) {
    config = bot.guildOverrides[id];
  }

  const updatedConfig = merge(
    config,
    {
      [scope]: { [key]: value },
    },
  );

  bot.guildOverrides[id] = updatedConfig;

  fs.writeFile(path.resolve(guildConfigsPath, `./${id}.json`), JSON.stringify(bot.guildOverrides[id]), (err) => {
    if (err) reject(new Error(`Writing to ${guildConfigsPath}/${id}.json failed with the following error:\n${err}`));

    resolve(updatedConfig);
  });
});
