// =====================================================================================
//                                    ! heavybreathing command
// =====================================================================================
// Heavy breathing cat

const moment = require('moment-timezone');
const chalk = require('chalk');

exports.run = (bot, message, args) => {
    try {
        let filepath = "../images/memes/heavybreathing.png";
        message.channel.send(``, { file: filepath });
        console.log(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] User ${message.author.username} summoned a heavy breathing cat. *heavy breathing*`);
    } catch (err) {
        console.log(chalk.bgRed(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] ${err}`));
    }
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: true,
    aliases: ["heavybreathingcat"],
    permLevel: 0
};

exports.help = {
    name: 'heavybreathing',
    description: `*heavy breathing*`,
    usage: 'heavybreathing'
};