// =====================================================================================
//                                  ! emojilist command
// =====================================================================================
// Returns all of the Extended Emoji emojis

const chalk     = require('chalk');
const Discord   = require('discord.js');
const moment    = require('moment');
const settings  = require('../../settings.json');
const TestGuild = settings.testguild;
var   emojiList = new Map();

exports.run = (bot, message, args) => {
    try {
        if (args[1]) {
            switch (args[1]) {
                case "help":
                case "howto":
                case "whatisit":
                    let str = `Normally, a server can only have 50 custom emojis. Here in ${message.guild.name}, through the power of ${bot.user}, you can access even more emojis!`+
                    ` Just type the appropriate code for the emoji you want and ${bot.user} will replace your message with the emoji editted in.\n\n`+
                    `*Use \`${settings.prefix}emojilist\` or \`${settings.prefix}emojilist (page#)\` to see the list of extra emoji you can use!*`;

                    let embed = new Discord.RichEmbed().setTitle('Extended Emoji List').setDescription(str);
                    message.channel.send({embed: embed});
                break;
                default:
                    let pageGiven = parseInt(args[1], 10) - 1;
                    if (!isNaN(pageGiven)) this.buildEmojiList(bot, message, pageGiven); 
                    else this.buildEmojiList(bot, message, -1);
                break;
            }
        } else {
            this.buildEmojiList(bot, message, -1);
        }
    } catch (err) {
        console.log(chalk.bgRed(`[${moment().format('hh:mm:ssA MM/DD/YY')}] ${err}`));
    }
};

exports.buildEmojiList = (bot, message, pageGiven) => {
    let ac = 0;
    let g = bot.guilds.get(TestGuild);
    let emojis = g.emojis;
    let embeds = new Map();
    let splitValue = settings.rules.extended_emoji.split_value;
    if (pageGiven > Math.ceil(emojis.size/splitValue) || pageGiven < -1) pageGiven = -1;
    if (pageGiven === 0) pageGiven = 1;
    let currentPage = (pageGiven === -1 || typeof pageGiven == 'undefined' || typeof pageGiven == 'NaN') ? 0 : pageGiven;

    emojis.forEach((emoji, index) => {
        if (pageGiven === -1 || pageGiven === currentPage) {
            if (ac === currentPage*splitValue) {
                let embed = new Discord.RichEmbed();
                embeds.set(currentPage, embed);
                embeds.get(currentPage).setTitle(`Extended Emoji List`).setDescription(`\`page ${currentPage+1}/${Math.ceil(emojis.size/splitValue)}\``+
                ` \`Showing emojis ${currentPage*splitValue+1} ~ ${(emojis.size-1 < (currentPage+1)*splitValue) ? emojis.size : (currentPage+1)*splitValue}\``);
            }
            if (pageGiven === -1 || (ac >= currentPage*splitValue && ac <= (currentPage+1)*splitValue-1)) {
                embeds.get(currentPage).addField(`:${emoji.name}:`, `<:${emoji.name}:${emoji.id}>`, true);
            }
            if (ac === (currentPage+1)*splitValue-1 || ac === emojis.size-1) {
                message.channel.send({embed: embeds.get(currentPage)});
                currentPage++;
            }
            ac++;
        }
    });
};

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: true,
    textChannelOnly: true,
    aliases: ['extraemoji','extraemojis','extendedemoji','extendedemojis','el'],
    permLevel: 0
};

exports.help = {
    name: 'emojilist',
    description: `See the list of 'Extended Emoji' for this server`,
    usage: 'emojilist [page#]\n\nUse the [page#] option to see a specific page of the Extended Emoji list. Not giving a page# will just display the whole Extended Emoji list. Likewise, giving an invalid page# will just cause the whole list to display.'
};