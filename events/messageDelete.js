// Whenever a message is deleted / removed

let lfg = require('../handlers/LFGHandler');

module.exports = (message) => {
  const bot = message.client;

  if (bot.lfgStack.has(message.id)) {
    lfg.cancel(bot, message.id, true);
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
