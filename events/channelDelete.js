// This event triggers whenever a channel in a guild is deleted
// Ggis will remove the channel from the StreamLink notification list, if necessary

var streamlink = require('ggis/StreamLinkHandler');

module.exports = channel => {
    let bot = channel.client;
    bot.streamLink.guilds.forEach(guild => {
        if (guild.channels.includes(channel.id)) {
            streamlink.removeChannel(void 0, bot, channel);
        }
    });
};

module.exports.reloadHandler = function () {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`ggis/StreamLinkHandler`)];
            streamlink = require(`ggis/StreamLinkHandler`);
            resolve();
        } catch (err) {
            reject(err);
        }
    });
};