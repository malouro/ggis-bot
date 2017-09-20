// This event is for when a message is deleted
// This is *vital* for making sure !lfg doesn't break when the messages are deleted

var   lfg    = require('../util/lfgHandler');
const chalk  = require('chalk');
const fs     = require('fs');
const moment = require('moment-timezone');

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