// =====================================================================================
//                             ! bitchholdon command
// =====================================================================================
// Activates my trap card!

const moment = require('moment-timezone');
const chalk = require('chalk');
const filepath = "../images/memes/bitchholdon.jpg";

exports.run = (bot, message, args) => {
    try {
        if (typeof args[1] !== 'undefined') {
            if (message.mentions.users.size > 0) {
                return message.channel.send(`${message.mentions.users.first()},`, { file: filepath });
            }
        }
        message.channel.send({ file: filepath });
    } catch(err) {
        console.log(chalk.bgRed(`[${moment().format('h:mm:ssA MM/DD/YY')}] ${err}`));
    }
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    aliases: [],
    permLevel: 0
};

exports.help = {
    name: 'bitchholdon',
    description: `Bitch, hold on! Lemme activate my trap card...`,
    usage: 'bitchholdon'
};