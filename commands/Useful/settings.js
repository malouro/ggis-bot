/**
 * @func !settings
 *
 * Configure server-specific settings
 */

/* eslint-disable no-restricted-globals */
const beautify = require('json-beautify');
const settings = require('../../settings.json');
const { serverSettings: testServerSettings } = require('../../test/data');
const { getGuildCommandPrefix, update: updateGuildConfig, deleteSetting } = require('../../handlers/GuildSettings');

const commandName = 'settings';

/**
 *-------------------------------------------------------------------------------
 *
 * @typedef {"string"|"number"|"integer"|"range"|"boolean"|"array"|"textChannel"|"user"} ServerSettingType - Types that the setting values can be
 * @typedef {"string"|"number"|"integer"|"range"|"boolean"|"textChannel"|"user"} ServerSettingTypeInsideArray - Types of the inner elements of array-typed settings
 *
 * -------------------------------------------------------------------------------
 *
 * @typedef {Object} ServerSettingKey - These are the individual settings that can be altered themselves
 *
 * @property {ServerSettingType} ServerSettingKey.type
 * @property {any} ServerSettingKey.default
 * @property {string} ServerSettingKey.description
 * @property {number} [ServerSettingKey.min] - Minimum value when `type` is "range"
 * @property {number} [ServerSettingKey.max] - Maximum value when `type` is "range"
 * @property {ServerSettingTypeInsideArray} [ServerSettingKey.innerType] - Type of the inner array elements when `type` is "array"
 *
 *-------------------------------------------------------------------------------
 *
 * @typedef {Object.<string, ServerSettingKey>} ServerSettingScope - These are the "categories" for the settings
 *
 * @property {string} ServerSettingScope.description - Description for the scope of settings
 *
 *-------------------------------------------------------------------------------
 *
 * @typedef {Object.<string, ServerSettingScope>} ServerSettings
 */

/** @type {ServerSettings} */
const configOptions = {
  bot: {
    description: 'General bot settings',
    prefix: {
      type: 'string',
      default: settings.prefix,
      description: 'The prefix for executing commands.',
    },
  },

  commandChannels: {
    description: 'Controls where and how commands are allowed to be used',
    enabled: {
      type: 'boolean',
      default: (settings.commandChannels && settings.commandChannels.enabled) || true,
      description: 'Enables control of command channels',
    },
    locklist: {
      type: 'array',
      innerType: 'textChannel',
      default: (settings.commandChannels && settings.commandChannels.locklist) || [],
      description: 'List of channels that ONLY accept command usage',
    },
    whitelist: {
      type: 'array',
      innerType: 'textChannel',
      default: (settings.commandChannels && settings.commandChannels.whitelist) || [],
      description: 'List of channels where command usage is allowed',
    },
    blacklist: {
      type: 'array',
      innerType: 'textChannel',
      default: (settings.commandChannels && settings.commandChannels.blacklist) || [],
      description: 'List of channels where command usage is NOT allowed',
    },
    strictMode: {
      type: 'boolean',
      default: (settings.commandChannels && settings.commandChannels.strictMode) || false,
      description: 'If on: deletes non-compliant messages in correlating channels',
    },
  },

  // =================== Example: ===================
  // lfg: {
  //   create_temp_channel: {
  //     type: 'boolean',
  //     default: settings.lfg.create_temp_channel,
  //     description: 'Whether to make a temporary text channel for an LFG party',
  //   },
  // },
  // =================================================

  // For testing purposes only:
  ...(process.env.NODE_ENV === 'test' ? testServerSettings : {}
  ),
};

exports.help = {
  name: commandName,
  description: "Change the bot's server settings",
  usage: (bot, message) => {
    const prefix = getGuildCommandPrefix(bot, message);
    const scopes = Object.keys(configOptions);
    return `
${commandName} <scope> (<setting> <value>)

<scope> is required and can be any of the following:

- list   :: List all available settings
- show   :: Show current config for the server
- reset  :: Reset a specific setting, or all settings
- remove :: Alias for "reset"

${scopes.map(scope => `- ${scope} :: ${configOptions[scope].description || '<no description>'}`).join('\n')}

If <scope> is *not* "list" or "show", you must also provide <setting> and <value> options. Use "${prefix}${commandName} list" for more info on available settings & values options.
If using "reset" or "remove, you must list the <scope> and <setting> options after.
Examples ::

${prefix}${commandName} show             ║ Shows the current config for the server
${prefix}${commandName} list             ║ Shows all available settings that can be modified
${prefix}${commandName} reset bot prefix ║ Reset the bot prefix for this server
${prefix}${commandName} bot prefix $     ║ Changes command prefix to "$" in this server
`.trim();
  },
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: true,
  aliases: [],
  permLevel: 3,
};

/**
 * Returns an array with whether the input is valid for the given expectedType,
 * and the casted type output to transform the input into.
 * (this is because we want to convert the input, which is always `string` into
 * something suitable for the given expectedType)
 *
 * @param {string|Array<string>} input String input for the value attempting to be set
 * @param {ServerSettingType} expectedType Type the input is expected to be
 * @param {ServerSettingKey} settingConfig Config object for the setting
 * @param {import('discord.js').Client} bot Ggis-bot
 * @returns {Array<Boolean, any>}
 */
function validateType(input, expectedType, settingConfig, bot) {
  // Input MUST be `string`, EXCEPT for `array` type
  // (if not then something went haywire; time to abort)
  if (typeof input !== 'string') {
    if (expectedType === 'array') {
      const recurseValidation = input.map(element => validateType(
        element, settingConfig.innerType, settingConfig, bot,
      ));

      return [
        // If any element fails validation against the `innerType`, then input was invalid
        Array.isArray(input)
        && recurseValidation.every(([valid]) => valid === true),
        // Return casted values
        recurseValidation.map(([, value]) => value),
      ];
    }
    return [false, null];
  }

  if (input === 'true' || input === 'false') {
    return [expectedType === 'boolean', Boolean(input === 'true')];
  }

  // Don't accept "Infinity" or - somehow? - an empty string
  if (!isNaN(input) && input !== '' && input !== 'Infinity') {
    switch (expectedType) {
      // input is any number (float, int, etc.)
      case 'number':
        return [true, Number(input)];

      // input is integer
      case 'integer':
        return [Number.isInteger(Number(input)), Number(input)];

      // input is a number in given range
      case 'range': {
        if (
          !settingConfig
          || !('min' in settingConfig)
          || !('max' in settingConfig)
        ) return [false, null];

        const num = parseFloat(input);

        return [num >= settingConfig.min && num <= settingConfig.max, num];
      }

      // Allow for strings that look like numbers (or Snowflakes)
      case 'string':
      case 'textChannel':
      case 'user':
        break;

      // fail otherwise: input is a number, but was supposed to be something else
      default:
        return [false, null];
    }
  }

  const snowflakeRegExp = /[1-9][0-9]+/;

  // If input looks like a `#text-channel` mention or Snowflake
  if ((input.match(`<#${snowflakeRegExp}>`) || input.match(snowflakeRegExp)) && expectedType === 'textChannel') {
    const channelSnowflake = input.replace(/[<#>]/g, '');

    return [bot.channels.cache.has(channelSnowflake), channelSnowflake];
  }

  // If input looks like a `@User` mention or Snowflake
  if ((input.match(`<!@${snowflakeRegExp}>`) || input.match(snowflakeRegExp)) && expectedType === 'user') {
    const userSnowflake = input.replace(/[<!@>]/g, '');

    return [bot.users.cache.has(userSnowflake), userSnowflake];
  }

  // String type setting can accept anything that came in via "args"
  // (since they *should* be strings to begin with)
  return [expectedType === 'string', input];
}

/**
 * Returns description for given config setting
 *
 * @param {ServerSettingKey} setting
 * @return {string} Setting description
 */
function getTypeDesc(setting) {
  const { type } = setting;
  switch (type) {
    case 'string':
    case 'boolean':
    case 'number':
      return type;
    case 'integer':
      return 'integer (whole number)';
    case 'range':
      return `number between ${setting.min || 0} and ${setting.max || Infinity}`;
    case 'array':
      return `array of \`${setting.innerType || 'string'}\`s`;
    case 'textChannel':
      return 'text channel (`#text-channel` or channel ID)';
    case 'user':
      return 'user (`@User` mention or user ID)';
    default:
      return 'string';
  }
}

/**
 * @return {string} Description of all available config settings
 */
function getAllSettings() {
  let message = "Here's the full list of settings that can be configured:\n\n```asciidoc\n";
  const scopes = Object.keys(configOptions);

  scopes.forEach((scope, index) => {
    message += `=== Scope: "${scope}" ===\n\n`;
    const keys = Object.keys(configOptions[scope]);

    delete keys.description;

    keys.forEach((key) => {
      if (key === 'description') return;

      message += `${key} :: ${configOptions[scope][key].description || ''} [type: ${getTypeDesc(configOptions[scope][key])}]`;
      message += configOptions[scope][key].default ? ` [default: ${configOptions[scope][key].default}]\n` : '\n';
    });

    if (index !== scopes.length - 1) message += '\n';
  });

  message += '```';
  return message;
}

/**
 * @param {string} scope Scope in configOptions to check if valid
 * @returns {boolean} If the given scope is valid or not
 */
function validateScope(scope) {
  const scopes = Object.keys(configOptions);

  return scopes.includes(scope);
}

/**
 * @param {string} scope Scope in configOptions to check
 * @param {string} key Key within scope to check
 * @returns {boolean} If the given key is valid within the scope
 */
function validateSetting(scope, key) {
  const keys = Object.keys(configOptions[scope]);

  return keys.includes(key);
}

exports.run = async (bot, message, args) => {
  let reset = false;
  const prefix = getGuildCommandPrefix(bot, message);
  const fullListMessage = `To see a full list of available settings and scopes, use \`${prefix}${commandName} list\``;

  function getCurrentGuildConfig(input) {
    let config = null;
    // Given the ID of the guild
    if (typeof input === 'string' && bot.guildOverrides[input]) {
      config = bot.guildOverrides[input];
    } else {
      config = input;
    }

    const prettyConfig = typeof config === 'object' ? beautify(config, null, 2, 80) : 'No setting overrides for this server.';

    return [
      "Here's the current config for this server:",
      '',
      '```json',
      prettyConfig,
      '```',
    ].join('\n');
  }

  function checkScopeWasGiven() {
    if (!args[1]) {
      message.reply(`You must provide a scope to specify what type of settings you want to configure.\n\n${fullListMessage}`);
      return false;
    }
    return true;
  }

  /**
   * !settings list
   * Displays available settings that can be configured
   */
  if (args[1] === 'list') {
    return message.reply(getAllSettings());
  }
  /**
   * !settings show
   * Shows the current configuration for the server
   */
  if (args[1] === 'show') {
    return message.reply(getCurrentGuildConfig(message.guild.id));
  }
  /**
   * !settings reset
   * Resets a given server setting(s)
   */
  if (args[1] === 'reset' || args[1] === 'remove') {
    reset = true;
    args.shift();
  }

  /* Check <scope> */
  const scope = args[1];
  if (!checkScopeWasGiven(scope)) return null;
  if (!validateScope(scope)) return message.reply(`\`${scope}\` is not an available scope of settings that can be configured.\n\n${fullListMessage}`);

  /* Check <key> */
  if (!args[2]) return message.reply(`No \`key\` given. Please provide the name of the setting you want to edit for this server.\n\n${fullListMessage}`);
  const key = args[2];
  if (!validateSetting(scope, key)) return message.reply(`\`${key}\` is not an available setting within \`${scope}\`.\n\n${fullListMessage}`);

  if (reset) {
    let errorOnReset = null;
    const configAfterReset = await deleteSetting(
      bot,
      message.guild.id,
      scope,
      key,
    ).catch((err) => {
      errorOnReset = err;
      console.error(err);
      message.reply([
        'Uh-oh, something went wrong trying to remove that setting override.',
        'Maybe this server doesn\'t have that setting configured?',
        '',
        `Check \`${prefix}settings show\` to see this server's setting configuration.`,
      ].join('\n'));
    });

    if (errorOnReset) return null;
    return message.reply(`
Successfully removed override of setting \`${scope}.${key}\`

${getCurrentGuildConfig(configAfterReset)}
`.trim());
  }

  /* Check <value> */
  if (!args[3]) {
    return message.reply(
      `No \`value\` given. Please provide a value of of type \`${configOptions[scope][key].type || 'string'}\` for this setting.\n\n${fullListMessage}`,
    );
  }

  const expectedType = configOptions[scope][key].type || 'string';

  /* If multiple strings were given for <value>, send over the array of arguments */
  /* (Otherwise, just send the single value) */
  const value = (args.length >= 4 && expectedType === 'array') ? Array.from(args).slice(3, args.length) : args[3];
  const [valid, castedValue] = validateType(value, expectedType, configOptions[scope][key], bot);

  if (!valid) {
    return message.reply(
      `\`${value}\` is not a valid value. Expected type of \`${expectedType}\``.concat(
        expectedType === 'range'
          ? ` (between ${configOptions[scope][key].min || 0} - ${configOptions[scope][key].max || Infinity})`
          : '',
      ).concat(
        expectedType === 'array'
          ? ` with elements of type \`${configOptions[scope][key].innerType || 'string'}\``
          : '',
      ),
    );
  }

  let errorOnUpdate = null;
  const updatedConfig = await updateGuildConfig(bot, message.guild.id, scope, key, castedValue)
    .catch((err) => {
      errorOnUpdate = err;
      console.error(err);
      message.reply([
        'Uh-oh, something went wrong trying to save or update the server\'s settings.',
        '',
        `Check \`${prefix}settings show\` to see this server's current configuration.`,
      ].join('\n'));
    });

  if (errorOnUpdate) return null;
  return message.reply(`
Successful change of \`${scope}.${key}\` to \`${value}\`!

${getCurrentGuildConfig(updatedConfig)}
`.trim());
};
