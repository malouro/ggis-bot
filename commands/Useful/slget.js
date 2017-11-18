
// =====================================================================================
//                              ! test command
// =====================================================================================

var sl = require('../../util/streamlinkHandler');
var http = require('http');

exports.run = (bot, message, args, perms) => {
    let stream = '';
    if (args[1]) stream = '/' + args[1];

    var options = {
        host: `https://api.twitch.tv/kraken/channels${stream}`,
        headers: {
            'Client-ID': 'vl69ccb274q2ebeikwoftv5x1xgcu8'
        }
    };

    http.get(options, function (res) {
        console.log("Got response: " + res.statusCode);
        console.log(res);
    }).on('error', function (e) {
        console.log("Got error: " + e.message);
    });
}

exports.conf = {
    enabled: true,
    visible: false,
    guildOnly: false,
    textChannelOnly: true,
    aliases: [],
    permLevel: 4
};

exports.help = {
    name: 'slget',
    description: `For testing purposes.`,
    usage: 'slget'
};
