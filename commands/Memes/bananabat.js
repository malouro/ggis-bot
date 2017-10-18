// =====================================================================================
//                                 ! bananabat command
// =====================================================================================
// Bananananananananananananananananananananananananananananananananananananananana bat

const moment = require('moment-timezone');
const chalk = require('chalk');

exports.run = (bot, message, args) => {
    try {
        message.channel.send(`🍌🦇 http://i.imgur.com/ym5ek1y.gifv 🍌🦇`);
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
    name: 'bananabat',
    description: `Bananananananananana bat`,
    usage: 'bananabat'
};