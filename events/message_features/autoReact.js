/********************************************************************************************
 * AutoReactions
 *  This feature only works within the MainGuild or the TestGuild!
 *  
 *  @func autoReact 
 *      @param {Discord.Message} message
 *      @param {JSON} settings
 * 
 *  Returns a new message back to 'message' event
 *  Executes proper reaction based on the criteria met, if any
 *      @desc {TxtReactions}
 *          - Reads message, tests every RegEx needed to check for
 *          - If one, or more, matches: react appropriately
 *      @desc {AtReactions}
 *          - If a user is mentioned, check if the user has any registered AtReaction emoji
 *          - If so, react appropriately
 * 
 ********************************************************************************************/

var getAtReactions = require('./getAtReactions');
var getTxtReactions = require('./getTxtReactions');
var AtReactions = getAtReactions(new Map());
var TxtReactions = getTxtReactions(new Map());

module.exports = (message, settings) => {
    return new Promise((resolve, reject) => {
        try {
            if (settings.rules.autoreact.txtmentions) {
                TxtReactions = getTxtReactions(TxtReactions);
                TxtReactions.forEach((t, regex) => {
                    if (message.content.toLowerCase().match(regex)) {
                        switch (t.type) {
                            case "react":
                                if (t.reaction.length > 0) {
                                    reactInOrder(message, t.reaction[Math.floor(Math.random()*t.reaction.length)], 0);
                                } else {
                                    console.log(`No reactions in reaction array for "${t.description}" AutoReaction for a 'react' type AutoReact`);
                                }
                                break;
                            case "reply":
                                if (t.reply.message !== '') {
                                    replyReaction(message, t.reply);
                                } else {
                                    console.log(`No reply message for "${t.description}" AutoReaction for a 'reply' type AutoReact`);
                                }
                                break;
                            case "react-reply":
                            case "reply-react":
                                if (t.reaction.length > 0 && t.reply.message !== '') {
                                    replyReaction(message, t.reply);
                                    reactInOrder(message, t.reaction[Math.floor(Math.random()*t.reaction.length)], 0);
                                } else {
                                    if (t.reply.message === '') console.log(`No reply message for "${t.description}" AutoReaction for a 'reply' type AutoReact`);
                                    if (t.reaction.length <= 0) console.log(`No reactions in reaction array for "${t.description}" for a 'react' type AutoReact`);
                                }
                                break;
                            default:
                                console.log("Unexpected TxtReaction type in autoReact.js");
                                break;
                        }
                    }
                });
            }
            if (settings.rules.autoreact.atmentions && message.mentions.users.array().length > 0) {
                AtReactions = getAtReactions(AtReactions);
                message.mentions.users.forEach(u => {
                    if (AtReactions.has(u.id)) {
                        message.react(AtReactions.get(u.id).emoji[Math.floor(Math.random() * AtReactions.get(u.id).emoji.length)])
                            .then()
                            .catch(e => console.log(e));
                    }
                });
            }
            resolve();
        } catch (err) {
            reject(err);
        }
    });
};

// React to the message in a promise based fashion with every emoji in the given array, in ascending index order

reactInOrder = (message, emojis, i) => {
    if (emojis.length === 0) return;
    else if (i < emojis.length) {
        message.react(emojis[i]).then(() => {
            i++;
            reactInOrder(message, emojis, i);
        }).catch(err => console.log(err));
    }
};

// Reply to the message correctly, with the given file and/or string

replyReaction = (message, reply) => {
    if (reply.file !== "") message.reply(reply.message, { file: reply.file });
    else message.reply(reply.message);
};