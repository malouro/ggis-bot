// Whenever a message is deleted / removed

var lfg = require('ggis/LFGHandler');

module.exports = message => {

    var bot = message.client;

    if (bot.lfgStack.has(message.id)) {
        lfg.cancel(bot, message.id, true);
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