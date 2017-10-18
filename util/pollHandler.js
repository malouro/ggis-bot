// Handles all polls

const chalk   = require('chalk');
const Discord = require('discord.js');
const moment  = require('moment-timezone');
const optionEmojiNumbers = ['1⃣','2⃣','3⃣','4⃣','5⃣','6⃣','7⃣','8⃣','9⃣','0⃣'];
const optionEmojiLetters = ['🇦','🇧','🇨','🇩','🇪','🇫','🇬','🇭','🇮','🇯'];

module.exports = {
    /* * * 
    Creates a poll (w/ multiple options) >>
    * * */
    makePoll: function (bot, message, question, options) {
        let tooBig = false;
        if (!question.endsWith('?')) question = question + '?';
        if (options.length > optionEmojiLetters.length) {
            options.splice(optionEmojiLetters.length, options.length - optionEmojiLetters.length);
            tooBig = true;
        }
        var str = `\`poll\`\n${tooBig ? `\n*__NOTE:__ Not all of your options were added; there were too many! (max is ${optionEmojiLetters.length})*\n` : ''}\n**${question}**\n\n${options.map((o, index) => `${optionEmojiLetters[index]} ${o}`).join('\n')}`;
        message.channel.send(str).then(msg => {
            reactInOrder(msg, 0, options);
            console.log(chalk.bgYellow.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${message.author.username} has created a poll: "${question}"`));
        }).catch(err=>console.log(err));
    },

    /* * * 
    Creates a petition/poll (w/ two options {yay or nay}) >>
    * * */
    makePetition: function (bot, message, question) {
        var str = `\`poll/petition\`\n\n**${question}**\n\nAll in favor: hit 👍  All against: hit 👎`;
        message.channel.send(str).then(msg => {
            msg.react('👍').then(()=> {
                msg.react('👎').then(
                    console.log(chalk.bgYellow.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${message.author.username} has created a petition; topic: "${question}"`))
                ).catch(err=>console.log(err));
            }).catch(err=>console.log(err));
        }).catch(err=>console.log(err));
    }
};

// Recursive function that reacts to the message n times (up to 10)
var reactInOrder = function(message, n, options) {
    if (n >= options.length) return;
    else {
        message.react(optionEmojiLetters[n]).then(()=> {
            n++;            
            reactInOrder(message, n, options);
        }).catch(err => console.log(err));
    }
}