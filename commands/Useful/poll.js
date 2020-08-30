/**
 * @func !poll
 *
 * @desc Creates a poll/petition, with clickable reaction emoji for the votes
 */

let polls = require('../../handlers/PollHandler');

const settings = require('../../settings.json');
const { getGuildCommandPrefix } = require('../../handlers/GuildSettings');

exports.help = {
  name: 'poll',
  description: 'Makes a poll or petition',
  usage: (bot, message) => {
    const prefix = getGuildCommandPrefix(bot, message);
    return `poll Question ${settings.poll.divider} Option 1... ${settings.poll.divider} Option 2... ${settings.poll.divider} (etc.) *OR* ${prefix}poll PetitionTopic

Makes a poll/petition with the specified question or topic. Separate the options with "${settings.poll.divider}", if no options are given, a petition with a YAY and NAY option will be made.

Examples ::

${prefix}poll Thoughts on pineapple pizza? ${settings.poll.divider} WTF ${settings.poll.divider} It's ok I guess ${settings.poll.divider} Hawaiian pizza is best pizza ${settings.poll.divider} pls stop\n\
» Makes poll with 4 options about pineapple pizza

${prefix}poll Rename the server to "${settings.botNameProper} is #1"
» Makes a petition to rename the server to an obviously improved name ;)`;
  },
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: true,
  aliases: ['p', 'petition'],
  permLevel: 0,
};

exports.run = (bot, message, args) => {
  let str = '';
  args.splice(0, 1);
  args.forEach((arg, index) => {
    if (index !== args.length - 1) str = `${str + arg} `;
    else str += arg.toString();
  });
  const argsP = str.split(settings.poll.divider);
  const options = [];
  if (argsP.length === 1) {
    polls.makePetition(bot, message, argsP[0]);
  } else if (argsP.length > 1) {
    for (let i = 1; i < argsP.length; i++) {
      if (argsP[i] !== '') options.push(argsP[i].trim());
    }
    polls.makePoll(bot, message, argsP[0].trim(), options);
  }
};

exports.reloadHandler = () => new Promise((resolve, reject) => {
  try {
    delete require.cache[require.resolve('../../handlers/PollHandler')];
    polls = require('../../handlers/PollHandler');
    resolve();
  } catch (err) {
    reject(err);
  }
});
