// =====================================================================================
//                                  ! echo command
// =====================================================================================
// Echo a phrase onto a server/channel
// Makes the bot say stuff!

const chalk = require('chalk');
const moment = require('moment-timezone');
const settings = require('../../settings');
const msPerChar = 35;

exports.run = (bot, message, args, perms) => {
    try {
        if (!args[1]) return;
        let opts = { channel: message.channel, del: true, type: true, time: 0};
        let lastArg; let givenArgs = false, twoArgsLast = false, finishedWithArgs = false;
        args.splice(0,1);
        
        // Read possible arguments
        args.forEach((arg, index) => {
            if (arg.startsWith('--') || arg.startsWith('-') && !finishedWithArgs) {
                arg = arg.startsWith('--') ? arg.substr(2) : arg.substr(1);
                switch (arg) {
                    case 'channel':
                    case 'c':
                        if (perms >= 4) {
                            givenArgs = true;
                            lastArg = index;
                            if (args[index + 1]) {
                                opts.channel = bot.channels.get(args[index + 1]);
                                if (typeof opts.channel == 'undefined') return message.reply(`The channel ${args[index + 1]} doesn't seem to exist`);
                                else twoArgsLast = true;
                            } else {
                                return message.reply(`Need to specify the channel ID for **--channel** option!`);
                            }
                        } else {
                            return message.reply(`You do not have the proper permissions to use the **--channel** option.`);
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
            let str = args.join(' ');
            this.sendMessage(message, str, opts);
        } else if (givenArgs) {
            args.splice(0, lastArg + 1);
            let str = args.join(' ');
            this.sendMessage(message, str, opts);
        } else {
            let str = args.join(' ');
            this.sendMessage(message, str, opts);
        }
    } catch (err) {
        console.log(chalk.bgRed.bold(`[${moment().format(settings.timeFormat)}] ${err}`));
    }
};

exports.sendMessage = function (message, str, opts) {
    if (opts.type) {
        opts.time = str.length * msPerChar;
        opts.channel.startTyping();
        if (opts.del && message.channel.type === 'text') message.delete().then().catch(err => console.log(err));
        var func = setTimeout(function () {
            opts.channel.stopTyping(true);
            opts.channel.send(str);
            console.log(`[${moment().format(settings.timeFormat)}] ${message.author.username} echo'd the message "${str}"`);
        }, opts.time);
    } else {
        if (opts.del && message.channel.type === 'text') message.delete().then(() => {
            opts.channel.send(str);
            console.log(`[${moment().format(settings.timeFormat)}] ${message.author.username} echo'd the message "${str}"`);            
        }).catch(err => console.log(err));
        else opts.channel.send(str);
    }
};

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    textChannelOnly: false,
    aliases: [],
    permLevel: 0
};

exports.help = {
    name: 'echo',
    description: `Echo a message to the channel; make me say something!`,
    usage: 'echo <message>'
};