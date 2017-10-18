// Whenever an emoji reaction is removed from a message

var   lfg     = require('../util/lfgHandler');
const Discord = require('discord.js');
const fs      = require('fs');
const moment  = require('moment-timezone');

module.exports = (messageReaction, user) => {

    if (user.bot) return;
    var bot = messageReaction.message.client;

    /**
     * LFG stuff
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
            delete require.cache[require.resolve(`../util/lfgHandler`)];
            lfg = require(`../util/lfgHandler`);
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}