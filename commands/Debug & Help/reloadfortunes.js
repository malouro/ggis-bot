// =====================================================================================
//                              ! reloadfortunes command
// =====================================================================================
// Reloads fortune images from the fortunes Imgur album

const chalk = require('chalk');
const fs = require('fs');
const i2rss = require('imgur2rss');
const moment = require('moment');
const settings = require('../../settings.json');

exports.run = (bot, message, args) => {
    var images;
    var obj = { fortunes: [] };
    var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
    let clientID = settings.fortune.token;

    message.channel.send('Reloading fortunes...').then (m => {
        i2rss.album2rss(clientID, 'd5drq', (err, data) => {

            /** @todo Research what errors can be thrown by i2rss ? **/

            if (err) throw err;
            images = getImgs(data, 'img', 'src');
            images.forEach(img => {
                obj.fortunes.push(img);
            });
            // Update fortune amount in config file, and for the commands help menu
            if (images.length !== settings.fortune.amount) {
                settings.fortune.amount = images.length;
                fs.writeFile("./settings.json", JSON.stringify(settings), (err) => {
                    if (err) throw err;
                    bot.commandsReload(bot, 'fortune')
                        .then(console.log(chalk.bgHex('#ffcc52').black(`[${moment().format(settings.timeFormat)}] Fortunes reloaded & settings.json updated with new fortune amount!`)))
                        .catch(err => console.log(err));
                });
            }
            // URLs are thrown into fortunes.json file & saved
            fs.writeFile('./config/fortunes.json', JSON.stringify(obj), 'utf8', (err) => {
                if (err) throw err;
                m.edit(`Successfully reloaded the fortunes gallery!`)
                    .then(m.delete(1500)
                    .then(() => {
                        message.delete(1500);
                        console.log(chalk.bgHex('#ffcc52').black(`[${moment().format(settings.timeFormat)}] Fortunes reloaded!`));
                    }).catch(err => console.log(err)))
                .catch(err => console.log(err));
            });
        });
    }).catch(err => console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${err}`)));
}

function getImgs(str, node, attr) {
    var regex = new RegExp(`<${node} ${attr}="(.*?)" alt="`, "gi");
    var result, res = [];
    while ((result = regex.exec(str))) {
        res.push(result[1]);
    }
    return res;
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    textChannelOnly: true,
    aliases: ["rf"],
    permLevel: 4
};

exports.help = {
    name: 'reloadfortunes',
    description: `Reload fortune images from Imgur album`,
    usage: 'reloadfortunes'
};