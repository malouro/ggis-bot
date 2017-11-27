// =====================================================================================
//                                    ! heavybreathing command
// =====================================================================================
// Heavy breathing cat

const moment = require('moment');
const chalk = require('chalk');
const settings = require('../../settings');

exports.run = (bot, message, args) => {
    try {
        message.channel.send(``, { file: "../images/memes/heavybreathing.png" });
        console.log(`[${moment().format(settings.timeFormat)}] User ${message.author.username} summoned a heavy breathing cat. *heavy breathing*`);
    } catch (err) {
        console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${err}`));
    }
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    textChannelOnly: false,
    aliases: ["heavybreathingcat"],
    permLevel: 0
};

exports.help = {
    name: 'heavybreathing',
    description: `*heavy breathing*`,
    usage: 'heavybreathing'
};