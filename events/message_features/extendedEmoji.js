/**
 * @func extendedEmoji
 *  (Only applies to main guild)
 * 
 *  Extendeds test guild emoji into the main guild
 *  Checks for :EMOJI: use and replaces the message with a new one that contains the called emoji!
 */

const Discord = require('discord.js');
const RegExExtendedEmojis = /:\w+:(?!\d+>)/g

module.exports = (message, settings) => {
    return new Promise((resolve, reject) => {
        try {
            let g = message.client.guilds.get(settings.testguild);
            let emojiData = g.emojis;
            let emojiCodes = [];
            let emojis = new Map();
            let edit = false;
            let str = message.content.toString();

            emojiData.forEach((emoji) => {
                emojis.set(emoji.name, { id: emoji.id, name: emoji.name });
            });

            while ((emojiCodes = RegExExtendedEmojis.exec(str)) !== null) {
                let emoji = emojiCodes[0].toString().slice(1, emojiCodes[0].length - 1);
                if (emojis.has(emoji)) {
                    let e = emojis.get(emoji);
                    // Method (1): replace message with an embed that contains the extended emoji
                    if (settings.rules.extended_emoji.edit) {
                        edit = true;
                        str = str.replace(`:${e.name}:`, `<:${e.name}:${e.id}>`);
                        // Method (2): just react to the message with the emoji instead
                    } else {
                        message.react(e.id).then().catch(err => console.log(err));
                        return resolve(message);
                    }
                }
            }

            // If method (1) was used...
            if (edit) {
                message.delete().then(msg => {
                    if (settings.rules.extended_emoji.embed) {
                        let embed = new Discord.RichEmbed()
                            .setTitle(`says:`)
                            .setDescription(str)
                            .setAuthor(msg.author.username, msg.author.displayAvatarURL)
                            .setThumbnail(msg.author.displayAvatarURL);
                        msg.channel.send({ embed }).then(m => {
                            return resolve(m);
                        }).catch(err => console.log(err));
                    } else {
                        msg.channel.send(`\`${msg.author.username}:\`\n${str}`).then(m => {
                            return resolve(m);
                        }).catch(err => console.log(err));
                    }
                }).catch(err => console.log(err));
            }
        } catch (err) {
            reject(err);
        }
    });
}