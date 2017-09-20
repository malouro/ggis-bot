// This event is for reactions added to (new) messages
// This is *vital* for !lfg command and for Reaction Stats

var   lfg     = require('../util/lfgHandler');
const chalk   = require('chalk');
const Discord = require('discord.js');
const fs      = require('fs');
const moment  = require('moment-timezone');

module.exports = (messageReaction, user) => {

    if (user.bot) return;
    var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
    var memes = JSON.parse(fs.readFileSync('./config/memes.json', 'utf8'));
    var bot = messageReaction.message.client;

    // ---------------------------------------------------------
    // !LFG reaction inputs
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // Random Meme-ing
    // --------------------------------------------------------- 

    // :thinking:
    if (messageReaction.emoji.toString() === '🤔' && messageReaction.count >= memes.thinking.reaction_threshhold && (messageReaction.message.guild.id === settings.mainguild || messageReaction.message.guild.id === settings.testguild)) {
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

    // ---------------------------------------------------------
    // Reaction Stats stuff:
    // ---------------------------------------------------------
    // COMING SOON
    /* Weekly SQL reaction database
    sql.open(reactions_db).then().catch(console.error);
    sql.get(`SELECT * FROM reactions WHERE emojiIdentifier = "${messageReaction.emoji.identifier}"`).then(row => {
        if (!row) {
            sql.run("INSERT INTO reactions (emoji, emojiIdentifier, count) VALUES (?, ?, ?)", [messageReaction.emoji.name, messageReaction.emoji.identifier, 1]);
        }
        else {
            sql.run(`UPDATE reactions SET count = ${row.count + 1} WHERE emojiIdentifier = "${messageReaction.emoji.identifier}"`);
        }
    }).catch(() => {
        console.error;
        sql.run("CREATE TABLE IF NOT EXISTS reactions (emoji TEXT, emojiIdentifier TEXT, count INTEGER)").then(() => {
            sql.run("INSERT INTO reactions (emoji, emojiIdentifier, count) VALUES (?, ?, ?)", [messageReaction.emoji.name, messageReaction.emoji.identifier, 1]);
        }).catch(err => console.log(err));
    });    */
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