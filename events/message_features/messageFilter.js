/**
 * @func messageFilter
 *  Deletes/filters messages
 *  Returns whether or not a message has been deleted/filtered
 */

const moment = require('moment');
const chalk = require('chalk');

const RegExSailorMoon = /[s$]+\s*a+\s*[i1!]+\s*l+\s*[o0]+\s*r+[\W\s_]*m+\s*[o0]+\s*[o0]+\s*n/;

module.exports = (message, settings) => {

    /**
     * #nosailormoon
     *  Deletes "sailor moon" messages in the #nosailormoon text channel
     *  (this is just an example of an arbritrary use for this feature)
     */

    if (message.channel.name === 'nosailormoon' && settings.rules.sailormoon) {
        if (message.toString().toLowerCase().match(RegExSailorMoon)) {
            message.delete().then(() => {
                message.reply("Stop right there, weeb scum. No Sailor Moon in this channel!");
                console.log(chalk.bgMagenta.white(`[${moment().format('hh:mm:ssA MM/DD/YY')}] Weeb scum ${message.author.username} mentioned "Sailor Moon". Deleted message!`));
            }).catch(console.error);
            return true;
        } else {
            return false;
        }
    }

    /**
    * @todo Explicit content filter?
    * 
    */

    return false;

};
