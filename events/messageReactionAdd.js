
var   lfg     = require('../util/lfgHandler');
const chalk   = require('chalk');
const Discord = require('discord.js');
const fs      = require('fs');
const moment  = require('moment-timezone');

module.exports = (messageReaction, user) => {

    if (user.bot) return; // Ignore the bot's reactions
    var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
    var bot = messageReaction.message.client;

    /**
     * LFG stuff
     */

    if (messageReaction.emoji.toString() === '👍') {
        if (bot.lfgStack.has(messageReaction.message.id)) {
            if (user.id !== bot.lfgStack.get(messageReaction.message.id).party_leader_id) {
                lfg.addToParty(bot, messageReaction.message.id, user.id);
            }
        }
    }
    else if (messageReaction.emoji.toString() === '🚫') {
        if (bot.lfgStack.has(messageReaction.message.id)) {
            if (user.id === bot.lfgStack.get(messageReaction.message.id).party_leader_id) {
                lfg.cancel(bot, messageReaction.message.id, false);
            }
        }
    }

    /**
     * Random meme stuff
     */

    // If meme-ing isn't enabled, or not in a main guild, break out
    if (!settings.memes && (messageReaction.message.guild.id === settings.mainguild || messageReaction.message.guild.id === settings.testguild)) return; 

    // 🤔 gifs -->
    if (messageReaction.emoji.toString() === '🤔' && messageReaction.count >= memes.thinking.reaction_threshhold) {
        let memes = JSON.parse(fs.readFileSync('./config/memes.json', 'utf8'));
        let d = new Date();
        let t = d.getTime();
        if (t > memes.thinking.last_trigger + memes.thinking.reaction_cooldown * 60000) {
            messageReaction.message.channel.send({ file: `../images/memes/thinking${Math.floor(Math.random() * memes.thinking.files) + 1}.gif` });
            memes.thinking.last_trigger = t;
            fs.writeFile("./config/memes.json", JSON.stringify(memes), (err) => {
                if (err) console.error(moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + err);
            });
        }
    }
};

module.exports.reloadHandler = function() {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`../util/lfgHandler`)];
            lfg = require(`../util/lfgHandler`);
            resolve();
        }
        catch (err) {
            reject(err);
        }
    });
}