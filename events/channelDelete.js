// This event triggers whenever a channel in a guild is deleted
// Ggis will remove the channel from the StreamLink notification list, if necessary

let streamlink = require('../handlers/StreamLinkHandler');

module.exports = (channel) => {
  const bot = channel.client;
  bot.streamLink.guilds.forEach((guild) => {
    if (guild.channels.includes(channel.id)) {
      streamlink.removeChannel(undefined, bot, channel);
    }
  });
};

module.exports.reloadHandler = () =>
  new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve('../handlers/StreamLinkHandler')];
      streamlink = require('../handlers/StreamLinkHandler');
      resolve();
    } catch (err) {
      reject(err);
    }
  });
