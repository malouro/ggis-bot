/**
 *   ________        .__
 *  /  _____/   ____ |__| ______
 * /   \  ___  / ___\|  |/  ___/
 * \    \_\  \/ /_/  >  |\___ \
 *  \______  /\___  /|__/____  >
 *         \//_____/         \/
 *
 * @name Ggis-bot
 * @author Michael Louro
 * @license MIT
 */

const Discord = require('discord.js'); /* discord.js */
const settings = require('./settings.json'); /* get bot config */

const bot = new Discord.Client(); /* make bot client */

require('./handlers/Setup')(bot, settings); /* setup */

bot.login(settings.token); /* login */
