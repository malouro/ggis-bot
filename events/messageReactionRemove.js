// Whenever an emoji reaction is removed from a message

var lfg = require('ggis/LFGHandler');

module.exports = (messageReaction, user) => {

    if (user.bot) return;
    var bot = messageReaction.message.client;

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

module.exports.reloadHandler = function () {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`ggis/LFGHandler`)];
            lfg = require(`ggis/LFGHandler`);
            resolve();
        } catch (err) {
            reject(err);
        }
    });
};