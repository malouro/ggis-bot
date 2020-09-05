/**
 * @func !settings
 *
 * Configure server-specific settings
 */

/* eslint-disable no-restricted-globals */
/* */
const beautify = require('json-beautify');
const settings = require('../../settings.json');
const { getGuildCommandPrefix, update: updateGuildConfig } = require('../../handlers/GuildSettings');

const commandName = 'settings';

/**
 * Available `types`:
 * - string
 * - number
 * - integer
 * - range
 * - boolean
 */
const configOptions = {
  bot: {
    prefix: {
      type: 'string',
      default: settings.prefix,
      description: 'The prefix for executing commands.',
    },
  },
  lfg: {
    createTempChannel: {
      type: 'boolean',
      default: true,
      description: 'Whether to make a temporary party channel for LFG',
    },
  },
  ...(process.env.NODE_ENV === 'test' ? {
    test: {
      'range 0-12': {
        type: 'range',
        min: 0,
        max: 12,
        default: 0,
        description: 'Range',
      },
      number: {
        type: 'number',
      },
      integer: {
        type: 'integer',
      },
      boolean: {
        type: 'boolean',
      },
      string: {
        type: 'string',
      },
    },
  } : {}
  ),
};

/**
 * Returns an array with whether the input is valid for the given expectedType,
 * and the casted type output to transform the input into.
 * (this is because we want to convert the input, which is always `string` into
 * something suitable for the given expectedType)
 *
 * @param {string} input String input for the value attempting to be set
 * @param {string} expectedType Type the input is expected to be
 * @param {Object} settingConfig Config object for the setting
 * @returns {Array<Boolean, any>}
 */
const validateType = (input, expectedType, settingConfig) => {
  // Input MUST be `string`, if not then something went haywire; time to abort
  if (typeof input !== 'string') return [false, null];

  if (input === 'true' || input === 'false') {
    return [expectedType === 'boolean', Boolean(input === 'true')];
  }

  // Don't accept "Infinity" or - somehow? - an empty string
  if (!isNaN(input) && input !== '' && input !== 'Infinity') {
    switch (expectedType) {
      // input = any number (float, int, etc.)
      case 'number':
        return [true, Number(input)];

      // input = integer
      case 'integer':
        return [Number.isInteger(input), Number(input)];

      // input = a number in given range
      case 'range': {
        if (!settingConfig || !settingConfig.min || !settingConfig.max) return [false, null];
        const num = parseFloat(input);

        return [num >= settingConfig.min && num <= settingConfig.max, Number(input)];
      }

      // fail otherwise -> Input is a number, but wasn't one of the number types
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

    keys.forEach((key) => {
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
    return `
${commandName} <scope> <setting> <value>

<scope> is *mandatory* and can be any of the following:

- bot :: General bot settings
- lfg :: LFG-specific settings

Examples ::

${prefix}${commandName} bot prefix $                ║ Changes command prefix to "$" in this server
${prefix}${commandName} lfg createTempChannel false ║ Don't create temp channels for LFG in this server
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
    let config = {};
    // Given the ID of the guild
    if (typeof input === 'string') {
      config = bot.guildOverrides[input];
    } else {
      config = input;
    }
    const prettyConfig = beautify(config, null, 2, 80);

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
  if (!args[3]) return message.reply('No value given');
  const value = args[3];
  const expectedType = configOptions[scope][key].type || 'string';
  const [valid, castedValue] = validateType(value, expectedType);
  if (!valid) {
    return message.reply(
      `\`${value}\` is not a valid value. Expected type of \`${expectedType}\``.concat(
        expectedType === 'range'
          ? ` (between ${configOptions[scope][key].min || 0} - ${configOptions[scope][key].max || Infinity})`
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
