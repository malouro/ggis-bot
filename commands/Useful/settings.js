/**
 * @func !settings
 *
 * Configure server-specific settings
 */

/* eslint-disable no-restricted-globals */
const beautify = require('json-beautify');
const settings = require('../../settings.json');
const { serverSettings: testServerSettings } = require('../../test/data');
const { getGuildCommandPrefix, update: updateGuildConfig } = require('../../handlers/GuildSettings');

const commandName = 'settings';

/**
 *-------------------------------------------------------------------------------
 *
 * @typedef {"string"|"number"|"integer"|"range"|"boolean"|"array"} ServerSettingType - Types that the setting values can be
 * @typedef {"string"|"number"|"integer"|"range"|"boolean"} ServerSettingTypeInsideArray - Types of the inner elements of array-typed settings
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

  foo: {
    bar: {
      type: 'array',
      innerType: 'number',
      description: 'An array of numbers',
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

/**
 * Returns an array with whether the input is valid for the given expectedType,
 * and the casted type output to transform the input into.
 * (this is because we want to convert the input, which is always `string` into
 * something suitable for the given expectedType)
 *
 * @param {string|Array<string>} input String input for the value attempting to be set
 * @param {ServerSettingType} expectedType Type the input is expected to be
 * @param {ServerSettingKey} settingConfig Config object for the setting
 * @returns {Array<Boolean, any>}
 */
const validateType = (input, expectedType, settingConfig) => {
  // Input MUST be `string`, EXCEPT for `array` type
  // (if not then something went haywire; time to abort)
  if (typeof input !== 'string') {
    if (expectedType === 'array') {
      const recurseValidation = input.map(element => validateType(
        element, settingConfig.innerType, settingConfig,
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
        return [Number.isInteger(input), Number(input)];

      // input is a number in given range
      case 'range': {
        if (!settingConfig || !settingConfig.min || !settingConfig.max) return [false, null];
        const num = parseFloat(input);

        return [num >= settingConfig.min && num <= settingConfig.max, Number(input)];
      }

      // fail otherwise: input is a number, but was supposed to be something else
      default:
        return [false, null];
    }
  }

  // String type setting can accept anything that came in via "args"
  // (since they *should* be strings to begin with)
  return [expectedType === 'string', input];
};

const getTypeDesc = (setting) => {
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
    default:
      return 'string';
  }
};

const getAllSettings = () => {
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

- list :: List all available settings
- show :: show current config for the server
${scopes.map(scope => `- ${scope} :: ${configOptions[scope].description}`).join('\n')}

If <scope> is *not* "list" or "show", you must also provide <setting> and <value> options. Use "${prefix}${commandName} list" for more info on available settings & values options.

Examples ::

${prefix}${commandName} show            ║ Shows the current config for the server, pretty-printed
${prefix}${commandName} list            ║ Shows all available settings that can be modified
${prefix}${commandName} bot prefix $    ║ Changes command prefix to "$" in this server
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

/* eslint-disable-next-line no-unused-vars */
exports.run = async (bot, message, args) => {
  const prefix = getGuildCommandPrefix(bot, message);
  const getCurrentGuildConfig = (input) => {
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
  };
  const fullListMessage = `To see a full list of available settings and scopes, use \`${prefix}${commandName} list\``;

  if (!args[1]) return message.reply(`You must provide a scope to specify what type of settings you want to configure.\n\n${fullListMessage}`);

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

  /* Check <scope> */
  const scopes = Object.keys(configOptions);
  const scope = args[1];
  if (!scopes.includes(scope)) return message.reply(`\`${scope}\` is not an available scope of settings that can be configured.\n\n${fullListMessage}`);

  /* Check <key> */
  if (!args[2]) return message.reply(`No \`key\` given. Please provide the name of the setting you want to edit for this server.\n\n${fullListMessage}`);
  const keys = Object.keys(configOptions[scope]);
  const key = args[2];
  if (!keys.includes(key)) return message.reply(`\`${key}\` is not an available setting within \`${scope}\`.\n\n${fullListMessage}`);

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
  const [valid, castedValue] = validateType(value, expectedType, configOptions[scope][key]);

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

  const updatedConfig = await updateGuildConfig(bot, message.guild.id, scope, key, castedValue)
    .catch((err) => {
      console.error(err);
      message.reply('Uh-oh. Something went wrong trying to save the server config! :(');
    });

  return message.reply(`
Successful change of \`${scope}.${key}\` to \`${value}\`!

${getCurrentGuildConfig(updatedConfig)}
`.trim());
};
