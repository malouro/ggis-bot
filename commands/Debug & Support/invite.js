/**
 * @func !invite
 *
 * @desc Get invite link for the bot
 *
 * @todo More dynamic invite links, autogen a link rather than send a static one
 */

const moment = require('moment');
const settings = require('../../settings.json');

exports.help = {
  name: 'invite',
  description: `Posts invite link to invite ${settings.botNameProper} to your server`,
  usage: 'invite',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: false,
  aliases: [],
  permLevel: 0,
};

exports.run = (bot, message) => {
  message.channel.send(`If you wish to invite <@${bot.user.id}> to your Discord server, use the link below and choose a server from the dropdown list.` +
  'You must have the **Manage Server** permission on the server in order for it to show up on the list, and for the invite to work.\n\n' +
  'You may add or remove permissions as you please, but keep in mind that it might break current or future features.\n\n' +
  `${bot.generateInvite(523762774)}`);

  console.log(`[${moment().format(settings.timeFormat)}] User ${message.author.username} asked for an invite link`);
};
