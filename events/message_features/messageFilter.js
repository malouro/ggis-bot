/**
 * MessageFilter
 *  For now, this only applies to the MainGuild or TestGuild
 *
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
   *  (this is just an example of an arbitrary use for this feature)
   */

  if (message.channel.name.toLowerCase() === 'nosailormoon' && settings.rules.sailorMoon) {
    if (message.toString().toLowerCase().match(RegExSailorMoon)) {
      message.delete().then(() => {
        /**
         * @todo Custom message reply for this filter in external config file
         *  (as opposed to this hard coded string)
         */
        message.reply('Stop right there, weeb scum. No Sailor Moon in this channel!');
        console.log(chalk.bgMagenta.white(`[${moment().format(settings.timeFormat)}] Weeb scum ${message.author.username} mentioned "Sailor Moon". Deleted message!`));
      }).catch(console.error);
      return true;
    }
    return false;
  }

  /**
  * @todo Explicit content filter? NSFW filter? etc.
  */

  return false;
};
