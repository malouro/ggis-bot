/*************************************************
 *   ________        .__        
 *  /  _____/   ____ |__| ______
 * /   \  ___  / ___\|  |/  ___/
 * \    \_\  \/ /_/  >  |\___ \ 
 *  \______  /\___  /|__/____  >
 *         \//_____/         \/ 
 * 
 *  @name	Ggis
 *	@author	Michael Louro
 *	@version 2.0.0
 *  Last edit - Dec 3, 2017
 *
 ************************************************/

const Discord = require('discord.js');
const settings = require('./settings.json');
const bot = new Discord.Client();
require('ggis/setup')(bot, settings);
bot.login(settings.token);