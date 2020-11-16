const Discord = require('discord.js');
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

/**
 * Returns back the value of a config setting for the given server.
 * @param {Discord.Client} bot Bot instance
 * @param {Discord.Guild|Discord.Message|Discord.Channel|import('discord.js').Snowflake} input A message, channel, guild or ID for the given server
 * @param {string} scope {scope} of the setting
 * @param {string} key the name (or {key}) of the setting to grab
 * @param {any} [defaultSetting]
 */
exports.getGuildSpecificSetting = (bot, input, scope, key, defaultSetting) => {
  let id = null;

  /* Input = string */
  if (typeof message === 'string') {
    id = input;
  /* Input = Channel|Message */
  } else if (
    input
    && (
      process.env.NODE_ENV === 'test'
      || input instanceof Discord.Channel
      || input instanceof Discord.Message
    )
    && input.guild
  ) {
    ({ id } = input.guild);
  /* Input = Guild */
  } else if (
    (process.env.NODE_ENV === 'test' || input instanceof Discord.Guild)
    && input.id
  ) {
    ({ id } = input);
  }

  if (!bot.guilds.has(id)) {
    return console.error(`Guild of ID ${id} does not exist; was the input valid?`);
  }

  if (id) {
    if (
      bot.guildOverrides[id]
      && bot.guildOverrides[id][scope]
      && Object.prototype.hasOwnProperty.call(bot.guildOverrides[id][scope], key)
    ) {
      return bot.guildOverrides[id][scope][key];
    }
  }

  // eslint-disable-next-line no-nested-ternary
  return (typeof defaultSetting === 'undefined')
    ? (scope === 'bot' ? settings[key] : settings[scope][key])
    : defaultSetting;
};

/* Returns command prefix within the given server */
exports.getGuildCommandPrefix = (bot, input) => this.getGuildSpecificSetting(bot, input, 'bot', 'prefix', bot.prefix);

/**
 * Sets or updates the given value within the server's settings
 * @param {import('discord.js').Client} bot The bot instance
 * @param {import('discord.js').Snowflake} id ID of the Guild
 * @param {string} scope {scope} in settings
 * @param {string} key {key} in {scope}
 * @param {any} value {value} to set {scope.key} to for the given guild
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

/**
 * Resets/removes a setting within the config
 * @param {import('discord.js').Client} bot The bot instance
 * @param {import('discord.js').Snowflake} id ID of the guild
 * @param {string} scope {scope} in settings
 * @param {string} key {key} in {scope}
 * @returns {Promise} result from updated config
 */
exports.deleteSetting = (bot, id, scope, key) => new Promise((resolve, reject) => {
  try {
    let updatedConfig = bot.guildOverrides[id];

    if (!scope || !key) reject(new Error('`key` or `scope` is missing'));
    if (scope in bot.guildOverrides[id] && key in bot.guildOverrides[id][scope]) {
      delete bot.guildOverrides[id][scope][key];

      updatedConfig = bot.guildOverrides[id];

      fs.writeFile(path.resolve(guildConfigsPath, `./${id}.json`), JSON.stringify(bot.guildOverrides[id]), (err) => {
        if (err) reject(new Error(`Writing to ${guildConfigsPath}/${id}.json failed with the following error:\n${err}`));

        resolve(updatedConfig);
      });
    } else {
      reject(new Error(`Scope "${scope}" or key "${key}" are not currently overridden in this guild. Nothing to reset/remove.`));
    }
  } catch (err) {
    reject(err);
  }
});
