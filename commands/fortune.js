// =====================================================================================
//                              ! fortune command
// =====================================================================================
// Returns a random fortune cookie message from ./fortunes/ folder

const fs = require('fs');
const moment = require('moment-timezone');
const settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));

exports.run = (bot, message, args) => {
    fs.readdir('../images/fortunes', (err, files) => {
        if (err) throw err;
        else {
            var config = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
            let fortuneAmount = files.length;
            if (fortuneAmount !== config.fortune.amount) {
                config.fortune.amount = fortuneAmount;
                fs.writeFile("./settings.json", JSON.stringify(config), (err) => {
                    if (err) console.log(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] ${err}`);
                    else {
                        bot.reload('fortune').then().catch(err=>console.log(err));
                    }
                });
            }
            let rng = Math.floor(Math.random() * fortuneAmount) + 1;
            let filepath = `../images/fortunes/fortune (${rng}).jpg`;
            message.reply(`Here's your fortune!`, { file: filepath });
        }
    });
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    aliases: [],
    permLevel: 0
};

exports.help = {
    name: 'fortune',
    description: `Opens up a fortune cookie! (${settings.fortune.amount} total fortunes)`,
    usage: 'fortune'
};