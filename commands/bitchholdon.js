// =====================================================================================
//                             ! bitchholdon command
// =====================================================================================
// Activates my trap card!

const moment = require('moment-timezone');
const chalk = require('chalk');

exports.run = (bot, message, args) => {
    try {
        let filepath = "../images/memes/bitchholdon.jpg";
        if (typeof args[1] !== 'undefined') {
            if (message.mentions.users.size > 0) {
                return message.channel.send(`${message.mentions.users.first()},`, { file: filepath });
            }
        }
        message.channel.send(``, { file: filepath });
    } catch(err) {
        console.log(chalk.bgRed(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] ${err}`));
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
    description: `Use this when a nigga or bitch say some weird ass shit and you just have to call them out for it`,
    usage: 'bitchholdon'
};