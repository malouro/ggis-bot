// This event is for all incoming messages in client channels (servers & channels the bot is in)
// This includes everything needed for AutoReact, chat filters and commands

const fs = require('fs');
const cmd = require('./commands');
const settings = require('../settings');
const msgFilter = require('./message_features/messageFilter');
const autoReact = require('./message_features/autoReact');
const extEmoji = require('./message_features/extendedEmoji');

const RegExExtendedEmojis = /:\w+:(?!\d+>)/g;

module.exports = (message) => {
  if (message.author.bot && process.env.NODE_ENV !== 'test') return; // Ignore other bots' messages

  const updatedSettings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

  if (message.channel.type === 'text') {
    if (message.guild.id === settings.mainGuild || message.guild.id === settings.testGuild) {
      let deleted;

      if (settings.rules.filters) {
        deleted = msgFilter(message, settings);
      } else {
        deleted = false;
      }

      if (!deleted) {
        // If message *is not* filtered from above, check through autoReact and extEmoji functions
        const extEmojiOn = updatedSettings.rules.extendedEmoji.enable;
        const autoReactOn = updatedSettings.rules.autoReact.enable;

        if (!message.content.startsWith(settings.prefix)) {
          if (message.content.toString().match(RegExExtendedEmojis) && extEmojiOn) {
            extEmoji(message, settings).then().catch(console.error);
          }
          if (autoReactOn) {
            autoReact(message, settings).then().catch(console.error);
          }
        }
        cmd(message.client, message, settings);
      }
    } else {
      cmd(message.client, message, settings);
    }
  } else {
    cmd(message.client, message, settings);
  }
};
