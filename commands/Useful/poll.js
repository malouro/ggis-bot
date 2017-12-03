// =====================================================================================
//                              ! poll command
// =====================================================================================

var   polls     = require('ggis/PollHandler');
const chalk     = require('chalk');
const fs        = require('fs');
const moment    = require('moment-timezone');
const settings  = require('../../settings.json');

exports.run = (bot, message, args) => {
    var str = '';
    var settings = JSON.parse(fs.readFileSync('./settings.json','utf8'));

    args.splice(0, 1);
    args.forEach((arg, index) => {
        if (index !== args.length - 1) str = str + arg + ' ';
        else str = str + arg.toString();
    });
    var argsP = str.split(settings.poll.divider);
    var options = [];
    if (argsP.length === 1) {
        polls.makePetition(bot, message, argsP[0]);
    } else if (argsP.length > 1) {
        for (i = 1; i < argsP.length; i++) {
            if (argsP[i] !== '') options.push(argsP[i].trim());
        }
        polls.makePoll(bot, message, argsP[0].trim(), options);
    }
};

exports.reloadHandler = () => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`ggis/PollHandler`)];
            polls = require(`ggis/PollHandler`);
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    textChannelOnly: true,
    aliases: ["p", "petition"],
    permLevel: 0
};

exports.help = {
    name: 'poll',
    description: `Makes a poll or petition`,
    usage: `poll Question ${settings.poll.divider} Option 1... ${settings.poll.divider} Option 2... ${settings.poll.divider} (etc.) *OR* ${settings.prefix}poll PetitionTopic\n\n\
Makes a poll/petition with the specified question or topic. Seperate the options with "${settings.poll.divider}", if no options are given, a petition with a YAY and NAY option will be made.\n\n\
Examples ::\n\n\
${settings.prefix}poll Thoughts on pineapple pizza? ${settings.poll.divider} WTF ${settings.poll.divider} It's ok I guess ${settings.poll.divider} Hawaiian pizza is best pizza ${settings.poll.divider} pls stop\n\
» Makes poll with 4 options about pineapple pizza\n\n\
${settings.prefix}poll Rename the server to "${settings.botnameproper} is #1"\n\
» Makes a petition to rename the server to an obviously improved name ;)`
};
