// =====================================================================================
//                                    ! doge command
// =====================================================================================
// Big doge

const moment = require('moment');
const chalk = require('chalk');
const settings = require('../../settings');

exports.run = (bot, message, args) => {
    try {
        message.channel.send(``, { file: "../images/memes/doge.png" });
        console.log(`[${moment().format(settings.timeFormat)}] User ${message.author.username} summoned a big ol' doge`);
    } catch (err) {
        console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${err}`));
    }
};

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    textChannelOnly: false,
    aliases: ["bigdoge","giganticdoge"],
    permLevel: 0
};

exports.help = {
    name: 'doge',
    description: `such doge wow, much big`,
    usage: 'doge'
};