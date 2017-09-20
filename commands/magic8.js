// =====================================================================================
//                              ! magic8 command
// =====================================================================================
// Shake the Magic 8-Ball

const moment = require('moment-timezone');
const fs = require('fs');

exports.run = (bot, message, args) => {
    var responses = [];
    fs.readdirSync('../images/magic8/neg', (err, files) => {
        if (err) throw err;
        else {
            console.log(files);
            files.forEach(f => {
                responses.push(`/neg/${f}`);
            });
        }
    });
};

exports.conf = {
    enabled: false,
    visible: false,
    guildOnly: false,
    aliases: [],
    permLevel: 4
};

exports.help = {
    name: 'magic8',
    description: `Ask the Magic 8-Ball a question.`,
    usage: 'magic8 (question)'
};