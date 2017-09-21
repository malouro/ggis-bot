// =====================================================================================
//                                  ! emojilist command
// =====================================================================================
// Returns all of the Extended Emoji emojis

const fs     = require('fs');
const moment = require('moment-timezone');
const chalk  = require('chalk');

exports.run = (bot, message, args) => {
    try {
        let emojis = JSON.parse(fs.readFileSync('./config/emojis.json','utf8'));
        let fields = []; 
        emoji_list = emojis.emojis;
        emoji_list.forEach((e, index) => {
            fields.push({ name: `:${e.code}:`, value: `<${e.id}>`, inline: true });
        });
        message.channel.send({
            embed: {
                title: "Extended Emoji List",
                description: 
                `Here's the list of extra emoji to tag your messages with (ONLY as an emoji reaction).\n`+
                `Just type the appropriate code in any message you send (ie. :${emoji_list[0].code}:, :${emoji_list[1].code}:, etc.) and the emoji reaction will be added to your message!\n`+
                `\`${emoji_list.length} extra emoji\` \`${50-emoji_list.length} slots available\``,
                fields: fields
            }
        });        
    } catch (err) {
        console.log(chalk.bgRed(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] ${err}`));
    }
};

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: true,
    aliases: [],
    permLevel: 0
};

exports.help = {
    name: 'emojilist',
    description: `See the list of 'Extended Emoji' for this server`,
    usage: 'emojilist'
};