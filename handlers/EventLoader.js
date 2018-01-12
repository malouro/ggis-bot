/**
 * Attaches JavaScript to each of the bot's needed event listeners
 * @param {String} event
 */

const reqEvent = event => require(`../events/${event}`);

module.exports = (bot, settings) => {
  bot.on('ready', () => reqEvent('ready')(bot, settings));
  bot.on('reconnecting', () => reqEvent('reconnecting')(settings));
  bot.on('disconnect', () => reqEvent('disconnect')(settings));
  bot.on('message', reqEvent('message'));
  bot.on('messageDelete', reqEvent('messageDelete'));
  bot.on('messageReactionAdd', reqEvent('messageReactionAdd'));
  bot.on('messageReactionRemove', reqEvent('messageReactionRemove'));
  bot.on('guildCreate', reqEvent('guildCreate'));
  bot.on('guildDelete', reqEvent('guildDelete'));
  bot.on('guildMemberRemove', reqEvent('guildMemberRemove'));
  bot.on('channelDelete', reqEvent('channelDelete'));
};
