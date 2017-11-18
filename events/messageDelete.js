var lfg    = require('../util/lfgHandler');

module.exports = message => {

    var bot = message.client;

    if (bot.lfgStack.has(message.id)) {
        lfg.cancel(bot, message.id, true);
    }

};

module.exports.reloadHandler = function () {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`../util/lfgHandler`)];
            lfg = require(`../util/lfgHandler`);
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}