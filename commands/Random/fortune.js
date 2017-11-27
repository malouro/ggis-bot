// =====================================================================================
//                              ! fortune command
// =====================================================================================
// Returns a random fortune cookie message from ./fortunes/ folder

const fs = require('fs');
const moment = require('moment-timezone');
const settings = require('../../settings');

exports.run = (bot, message, args) => {
    var fortuneList = JSON.parse(fs.readFileSync("./config/fortunes.json", "utf8"));
    message.reply(`Here's your fortune! ${fortuneList.fortunes[Math.floor(Math.random()*fortuneList.fortunes.length)]}`);
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    textChannelOnly: false,
    aliases: ["fortunecookie"],
    permLevel: 0
};

exports.help = {
    name: 'fortune',
    description: `Opens up a fortune cookie! (${settings.fortune.amount} total fortunes)`,
    usage: 'fortune'
};