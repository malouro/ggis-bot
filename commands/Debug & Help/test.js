// =====================================================================================
//                              ! test command
// =====================================================================================

const fs = require('fs');
const i2rss = require('imgur2rss');
const settings = require('../../settings.json');

exports.run = (bot, message, args) => {
    /*
    var images;
    var obj = {fortunes: []};
    var settings = JSON.parse(fs.readFileSync('./settings.json','utf8'));
    let clientID = settings.fortune.token;
    
    i2rss.album2rss(clientID, 'd5drq', (err, data) => {
        if (err) throw err;
        images = getImgs(data, 'img', 'src');
        images.forEach(img => {
            obj.fortunes.push(img);
        });
        if (images.length !== settings.fortune.amount) {
            settings.fortune.amount = images.length;
            fs.writeFile("./settings.json", JSON.stringify(config), (err) => {
                if (err) console.log(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] ${err}`);
                bot.commandsReload('fortune').then().catch(err=>console.log(err));
            });
        }
        fs.writeFile('./config/fortunes.json',JSON.stringify(obj), 'utf8', (err) => {
            if (err) throw err;
            console.log('wrote fortunes.json');
        });
    });
    */
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
    visible: false,
    guildOnly: false,
    aliases: [],
    permLevel: 4
};

exports.help = {
    name: 'test',
    description: `For testing purposes.`,
    usage: 'test'
};