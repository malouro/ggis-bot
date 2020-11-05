// Whenever an emoji reaction is added to a message

let lfg = require('../handlers/LFGHandler');

/**
 * @param {import('discord.js').MessageReaction} messageReaction
 * @param {import('discord.js').User} user
 */
module.exports = async (messageReaction, user) => {
  console.log(user);

  if (user.bot) return; // Ignore the bot's reactions
  const bot = messageReaction.message.client;

  if (messageReaction.message.partial) await messageReaction.message.fetch();
  if (messageReaction.partial) await messageReaction.fetch();

  /**
   * LFG
   *  - ThumbsUp --> adds member to party, if possible
   *  - NoEntrySign --> cancels party, if possible
   */

  if (messageReaction.emoji.toString() === '👍') {
    if (bot.lfgStack.has(messageReaction.message.id)) {
      if (user.id !== bot.lfgStack.get(messageReaction.message.id).party_leader_id) {
        lfg.addToParty(bot, messageReaction.message.id, user.id);
      }
    }
  } else if (messageReaction.emoji.toString() === '🚫') {
    if (bot.lfgStack.has(messageReaction.message.id)) {
      if (user.id === bot.lfgStack.get(messageReaction.message.id).party_leader_id) {
        lfg.cancel(bot, messageReaction.message.id, false);
      }
    }
  }
};

module.exports.reloadHandler = () => new Promise((resolve, reject) => {
  try {
    delete require.cache[require.resolve('../handlers/LFGHandler')];
    lfg = require('../handlers/LFGHandler');
    resolve();
  } catch (err) {
    reject(err);
  }
});
