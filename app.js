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

const Discord = require('discord.js');
const settings = require('./settings.json');

const bot = new Discord.Client();

require('./handlers/Setup')(bot, settings);

bot.login(settings.token);
