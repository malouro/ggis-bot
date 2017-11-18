/********************************************************************************************
 * AutoReactions
 *  This feature only works within the MainGuild or the TestGuild!
 *  
 *  @func autoReact (message, settings)
 *  Returns a new message back to 'message' event
 *  Executes proper reaction based on the criteria met, if any
 *      @desc {TxtReactions}
 *          - Reads message, tests every RegEx needed to check for
 *          - If one, or more, matches: react appropriately
 *      @desc {AtRections}
 *          - If a user is mentioned, check if the user has any registered AtReaction emoji
 *          - If so, react appropriately
 * 
 ********************************************************************************************/

var getAtReactions = require('../../util/getAtReactions');
var getTxtReactions = require('../../util/getTxtReactions');
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
                                reactInOrder(message, t.reaction, 0);
                                break;
                            case "reply":
                                replyReaction(message, t.reply);
                                break;
                            case "react-reply":
                                replyReaction(message, t.reply);
                                reactInOrder(message, t.reaction, 0);
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

reactInOrder = function (message, emojis, i) {
    if (emojis.length === 0) return;
    else if (i < emojis.length) {
        message.react(emojis[i]).then(() => {
            i++;
            reactInOrder(message, emojis, i);
        }).catch(err => console.log(err));
    }
};

// Reply to the message correctly, with the given file and/or string

replyReaction = function (message, reply) {
    if (reply.file !== "") message.reply(reply.message, { file: reply.file });
    else message.reply(reply.message);
};