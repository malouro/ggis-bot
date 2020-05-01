// Whenever an emoji reaction is removed from a message

let lfg = require('../handlers/LFGHandler');

module.exports = (messageReaction, user) => {
  if (user.bot) return;
  const bot = messageReaction.message.client;

  /**
   * LFG
   *  - ThumbsUp --> Remove member from party, if possible
   */
  if (messageReaction.emoji.toString() === '👍') {
    if (bot.lfgStack.has(messageReaction.message.id)) {
      if (user.id !== bot.lfgStack.get(messageReaction.message.id).party_leader_id) {
        lfg.removeFromParty(bot, messageReaction.message.id, user.id);
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
