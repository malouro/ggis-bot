/**
 * ExtendedEmoji
 *  This feature only works within the MainGuild or the TestGuild!
 *
 *  @func extendedEmoji
 *      @param {Discord.Message} message
 *      @param {JSON} settings
 *
 *  Extends TestGuild emoji into the MainGuild
 *  Checks for :EMOJI: use reacts appropriately based on settings
 *
 *      @desc Method 1:
 *          Replace message w/ an embed that places in the ExtendedEmoji
 *          Deletes old message & have Ggis send a new one:
 *          @desc {Embed}
 *              ON - If Embed is On => Sends a MessageEmbed that has author, thumbnail, etc
 *              OFF - If Embed is Off => Sends a regular Discord message
 *      @desc :Method 2:
 *          React to the message with the ExtendedEmoji
 *
 */
const Discord = require('discord.js');

const RegExExtendedEmojis = /:\w+:(?!\d+>)/g;

module.exports = (message, settings) => new Promise((resolve, reject) => {
  try {
    const g = message.client.guilds.cache.get(settings.testGuild);
    if (typeof g === 'undefined') resolve(message);
    let emojiCodes = [];
    const emojis = new Map();
    let edit = false;
    let str = message.content.toString();

    g.emojis.forEach((emoji) => {
      emojis.set(emoji.name, {
        id: emoji.id,
        name: emoji.name,
        format: `${(emoji.animated) ? `<a:${emoji.name}:${emoji.id}>` : `<:${emoji.name}:${emoji.id}>`}`,
      });
    });

    /* eslint-disable */
      while ((emojiCodes = RegExExtendedEmojis.exec(str)) !== null) {
        let emoji = emojiCodes[0].toString().slice(1, emojiCodes[0].length - 1);
        if (emojis.has(emoji)) {
          let e = emojis.get(emoji);
          if (settings.rules.extendedEmoji.edit) {
            edit = true;
            str = str.replace(`:${e.name}:`, `${e.format}`);
          } else {
            message.react(e.id).then().catch(err => console.log(err));
            resolve(message);
          }
        }
      }
      /* eslint-enable */

    // If method (1) was used...
    if (edit) {
      message.delete().then((msg) => {
        if (settings.rules.extendedEmoji.embed) {
          const embed = new Discord.MessageEmbed()
            .setTitle('says:')
            .setDescription(str)
            .setAuthor(msg.author.username, msg.author.displayAvatarURL)
            .setThumbnail(msg.author.displayAvatarURL);
          msg.channel.send({ embed }).then((m) => {
            resolve(m);
          }).catch(err => console.log(err));
        } else {
          msg.channel.send(`\`${msg.author.username}:\`\n${str}`).then((m) => {
            resolve(m);
          }).catch(err => console.log(err));
        }
      }).catch(err => console.log(err));
    }
  } catch (err) {
    reject(err);
  }
});
