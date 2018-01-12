/**
 * @func !emojilist
 *
 * @desc Display the list of ExtendedEmoji for the server
 */

const Discord = require('discord.js');
const settings = require('../../settings.json');

const { testGuild } = settings;

exports.help = {
  name: 'emojilist',
  description: 'See the list of \'Extended Emoji\' for this server',
  usage: 'emojilist [page#]\n\nUse the [page#] option to see a specific page of the Extended Emoji list. Not giving a page# will just display the whole Extended Emoji list. Likewise, giving an invalid page# will just cause the whole list to display.',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: true,
  textChannelOnly: true,
  aliases: ['extraemoji', 'extraemojis', 'extendedemoji', 'extendedemojis', 'el'],
  permLevel: 0,
};

const buildEmojiList = (bot, message, pageGiven) => {
  let ac = 0;
  const g = bot.guilds.get(testGuild);
  const { emojis } = g;
  const embeds = new Map();
  const splitValue = settings.rules.extended_emoji.split_value;
  if (pageGiven > Math.ceil(emojis.size / splitValue) || pageGiven < -1) pageGiven = -1;
  if (pageGiven === 0) pageGiven = 1;
  let currentPage = (pageGiven === -1 || typeof pageGiven === 'undefined' || typeof pageGiven !== 'number') ? 0 : pageGiven;

  emojis.forEach((emoji) => {
    if (pageGiven === -1 || pageGiven === currentPage) {
      if (ac === currentPage * splitValue) {
        const embed = new Discord.RichEmbed();
        embeds.set(currentPage, embed);
        embeds.get(currentPage).setTitle('Extended Emoji List').setDescription(`\`page ${currentPage + 1}/${Math.ceil(emojis.size / splitValue)}\`` +
          ` \`Showing emojis ${currentPage(splitValue) + 1} ~ ${(emojis.size - 1 < (currentPage + 1) * splitValue) ? emojis.size : (currentPage + 1) * splitValue}\``);
      }

      /* eslint-disable */
      if (pageGiven === -1 || (ac >= currentPage * splitValue && ac <= ((currentPage + 1) * splitValue) - 1)) {
        embeds.get(currentPage).addField(`:${emoji.name}:`, `<:${emoji.name}:${emoji.id}>`, true);
      }

      if (ac === ((currentPage + 1) * splitValue) - 1 || ac === emojis.size - 1) {
        message.channel.send({ embed: embeds.get(currentPage) });
        currentPage++;
      }
      /* eslint-enable */
      ac++;
    }
  });
};

exports.run = (bot, message, args) => {
  if (args[1]) {
    switch (args[1]) {
      case 'help':
      case 'howto': {
        const str = `Normally, a server can only have 50 custom emojis. Here in ${message.guild.name}, through the power of ${bot.user}, you can access even more emojis!` +
          ` Just type the appropriate code for the emoji you want and ${bot.user} will replace your message with the emoji editted in.\n\n` +
          `*Use \`${settings.prefix}emojilist\` or \`${settings.prefix}emojilist (page#)\` to see the list of extra emoji you can use!*`;
        const embed = new Discord.RichEmbed().setTitle('Extended Emoji List').setDescription(str);
        /** Send the long message embed from above */
        message.channel.send({ embed });

        break;
      }
      default: {
        const pageGiven = parseInt(args[1], 10) - 1;

        /** Build emoji list dependent on the page given */
        if (typeof pageGiven === 'number') buildEmojiList(bot, message, pageGiven);
        else buildEmojiList(bot, message, -1);

        break;
      }
    }
  } else {
    buildEmojiList(bot, message, -1);
  }
};
