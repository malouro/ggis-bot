// =====================================================================================
//                                    ! doge command
// =====================================================================================
// Big doge

const moment = require('moment-timezone');
const chalk = require('chalk');

exports.run = (bot, message, args) => {
    try {
        message.channel.send(``, { file: "../images/memes/doge.png" });
    } catch (err) {
        console.log(chalk.bgRed(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] ${err}`));
    }
};

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: true,
    aliases: ["bigdoge","giganticdoge"],
    permLevel: 0
};

exports.help = {
    name: 'doge',
    description: `such doge wow`,
    usage: 'doge'
};