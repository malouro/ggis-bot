/**
 * @func !rules
 *
 * @desc Controls message features & rules (such as AutoReact & chat filters)
 *
 * @todo
 *  - REMASTER
 *    - Needs to be scalable with custom rules
 *    - Linting
 *    - Better documentation
 *    - Better structure
 *    - Maybe avoid using so many embeds? (or at least migrate to RichEmbeds)
 */

const settings = require('../../settings');

exports.help = {
  name: 'rules',
  description: `Set up and configure ${settings.botNameProper}-bot settings and rules (in the main server only)`,
  usage: `rules <category> [option]\n<category> can be (smoon/autoreact/help)\n[option] depends on the category in question (use the option "help" for more info on the category) (ie: ${settings.prefix}rules autoreact help)`,
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: true,
  textChannelOnly: true,
  aliases: [`${settings.botname}rules`],
  permLevel: 3,
};

exports.run = (bot, message, args) => {
  /** STARTING OVER */
};
