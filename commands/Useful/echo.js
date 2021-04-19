/**
 * @func !echo
 *
 * @desc Have the bot repeat a phrase in a given channel
 */

const moment = require('moment');
const settings = require('../../settings');

const { msPerChar } = settings.echo;

exports.help = {
  name: 'echo',
  description: 'Echo a message to the channel; make me say something!',
  usage: 'echo <message>',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: false,
  aliases: [],
  permLevel: 0,
};

const sendMessage = (message, str, opts) => {
  if (opts.type) {
    opts.time = str.length * msPerChar;
    opts.channel.startTyping();
    if (opts.del && message.channel.type === 'text') message.delete().then().catch(err => console.log(err));
    setTimeout(() => {
      opts.channel.stopTyping(true);
      opts.channel.send(str);
      console.log(`[${moment().format(settings.timeFormat)}] ${message.author.username} echo'd the message "${str}"`);
    }, opts.time);
  } else if (opts.del && message.channel.type === 'text') {
    message.delete().then(() => {
      opts.channel.send(str);
      console.log(`[${moment().format(settings.timeFormat)}] ${message.author.username} echo'd the message "${str}"`);
    }).catch(err => console.log(err));
  } else {
    opts.channel.send(str);
  }
};

exports.run = (bot, message, args, perms) => {
  if (!args[1]) return;

  const opts = {
    channel: message.channel,
    del: true,
    type: true,
    time: 0,
  };

  let lastArg;
  let givenArgs = false;
  let twoArgsLast = false;
  let finishedWithArgs = false;
  args.splice(0, 1);

  // Read possible arguments:
  args.forEach((arg, index) => {
    if ((arg.startsWith('--') || arg.startsWith('-')) && !finishedWithArgs) {
      arg = arg.startsWith('--') ? arg.substr(2) : arg.substr(1);
      switch (arg) {
        case 'channel':
        case 'c':
          if (perms >= 4) {
            givenArgs = true;
            lastArg = index;
            if (args[index + 1]) {
              opts.channel = bot.channels.cache.get(args[index + 1]);
              if (typeof opts.channel === 'undefined') message.reply(`The channel ${args[index + 1]} doesn't seem to exist`);
              else twoArgsLast = true;
            } else {
              message.reply('Need to specify the channel ID for **--channel** option!');
            }
          } else {
            message.reply('You do not have the proper permissions to use the **--channel** option.');
          }
          break;

        case 'dontdelete':
        case 'dd':
        case 'd':
          givenArgs = true;
          twoArgsLast = false;
          lastArg = index;
          opts.del = false;
          break;

        case 'notype':
        case 't':
          givenArgs = true;
          twoArgsLast = false;
          lastArg = index;
          opts.type = false;
          break;

        default:
          finishedWithArgs = true;
          break;
      }
    } else {
      finishedWithArgs = true;
    }
  });

  if (twoArgsLast && givenArgs) {
    args.splice(0, lastArg + 2);
    const str = args.join(' ');
    sendMessage(message, str, opts);
  } else if (givenArgs) {
    args.splice(0, lastArg + 1);
    const str = args.join(' ');
    sendMessage(message, str, opts);
  } else {
    const str = args.join(' ');
    sendMessage(message, str, opts);
  }
};
