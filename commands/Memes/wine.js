// =====================================================================================
//                                    ! wine command
// =====================================================================================
// Darkest Dungeon wine thrower

const moment = require('moment-timezone');
const chalk = require('chalk');
const catchPhrases = [
    "Mortality clarified in a single strike!",
    "Such a terrible assault cannot be left unanswered!",
    "Ringing ears, blurred vision - the end approaches...",
    "Unnerved, unbalanced...",
    "Death waits for the slightest lapse in concentration.",
    "Dazed, reeling, about to break...",
    "Exposed to a killing blow!",
    "Grievous injury, palpable fear...",
    "The walls close in – the shadows whispers of conspiracy.",
    "Reeling, gasping! Taken over the edge into madness!!"
]

exports.run = (bot, message, args) => {
    try {
        let filepath = "../images/memes/wine.png";
        message.channel.send(`*splurt*  **"${catchPhrases[Math.floor(Math.random()*catchPhrases.length)]}"**`, { file: filepath });
        console.log(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] User ${message.author.username} splurted wine everywhere. Kinda rude, huh?`);
    } catch (err) {
        console.log(chalk.bgRed(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] ${err}`));
    }
};

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    aliases: [],
    permLevel: 0
};

exports.help = {
    name: 'wine',
    description: `*splurt*`,
    usage: `wine\n\nIt's everyone's favorite wine throwing enemy from Darkest Dungeon. (complete w/ a random narrator quote)`
};