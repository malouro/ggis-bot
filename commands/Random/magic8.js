// =====================================================================================
//                              ! magic8 command
// =====================================================================================
// Shake the Magic 8-Ball

const fs        = require('fs');
const moment    = require('moment-timezone');

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
    console.log('m8');
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