// =====================================================================================
//                               ! jaden command
// =====================================================================================

const fs = require('fs');
const moment = require('moment');
const settings = require('../../settings');

exports.run = (bot, message, args) => {
    var conf = JSON.parse(fs.readFileSync('./config/quotes/jaden.json', 'utf8'));
    var rng = Math.floor(Math.random() * conf.tweets.length);
    message.channel.send(`${conf.baseURL}${conf.tweets[rng].url}`);
    console.log(`[${moment().format(settings.timeFormat)}] User ${message.author.username} Is Being Enlightened`);    
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    textChannelOnly: false,
    aliases: [],
    permLevel: 0
};

exports.help = {
    name: 'jaden',
    description: 'Get A Random Tweet From The Aristotle Of Our Generation',
    usage: 'jaden'
};