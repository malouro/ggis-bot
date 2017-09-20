// Handles all polls

const chalk   = require('chalk');
const Discord = require('discord.js');
const moment  = require('moment-timezone');

const optionEmoji = ['1⃣','2⃣','3⃣','4⃣','5⃣','6⃣','7⃣','8⃣','9⃣','0⃣'];

module.exports = {
    /* * * 
    Creates a poll (w/ multiple options) >>
    * * */
    makePoll: function (bot, message, question, options) {
        if (!question.endsWith('?')) question = question + '?';
        if (options.length > 10) options.splice(10, options.length - 10);
        var str = `\`poll\`\n\n**${question}**\n\n${options.map((o, index) => `${optionEmoji[index]} ${o}`).join('\n')}`;
        message.channel.send(str).then(msg => {
            reactInOrder(msg, 0, options);
            console.log(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${message.author.username} has created a poll: "${question}?"`);
        }).catch(err=>console.log(err));
    },

    /* * * 
    Creates a petition (w/ two options) >>
    * * */
    makePetition: function (bot, message, question) {
        var str = `\`petition\`\n\n**${question}**\n\nAll in favor, hit 👍!  All against, hit 👎`;
        message.channel.send(str).then(msg => {
            msg.react('👍').then(()=> {
                msg.react('👎').then(
                    console.log(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${message.author.username} has created a petition; topic: "${question}"`)
                ).catch(err=>console.log(err));
            }).catch(err=>console.log(err));
        }).catch(err=>console.log(err));
    }
};

const reactInOrder = function(message, n, options) {
    // Recursive function that reacts to the message N times (up to 10)
    if (n >= options.length) return;
    else {
        message.react(optionEmoji[n]).then(()=> {
            n++;            
            reactInOrder(message, n, options);
        }).catch(err => console.log(err));
    }
}