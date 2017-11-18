// This event is for all incoming messages in client channels (servers & channels the bot is in)
// This includes everything needed for AutoReact, chat filters and commands

const chalk	 	= require('chalk');
const Discord 	= require('discord.js');
const fs 		= require('fs');
const moment 	= require('moment');

const settings	= require('../settings.json');
var cmd 		= require('./commands');
var msgFilter 	= require('./message_features/messageFilter');
var autoReact 	= require('./message_features/autoReact');
var extEmoji 	= require('./message_features/extendedEmoji');

const RegExExtendedEmojis = /:\w+:(?!\d+>)/g;

module.exports = message => {

	if (message.author.bot) return; // Ignore other bots ** CRITICAL **
	if (message.channel.type !== 'text' && message.channel.type !== 'dm') return; // basically, just ignores group channels or voice channels (which won't get messages anyway)

	if (message.channel.type === 'text') {
		if (message.guild.id === settings.mainguild || message.guild.id === settings.testguild) {
			let settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
			let deleted = msgFilter(message, settings);
			if (!deleted) {
				if (!message.content.startsWith(settings.prefix)) { // pass into AutoReact and ExtendedEmoji handlers
					if (message.content.toString().match(RegExExtendedEmojis) && settings.rules.extended_emoji.enable) extEmoji(message, settings).then().catch(console.error);
					if (settings.rules.autoreact && settings.rules.autoreact.enable) autoReact(message, settings).then().catch(console.error);
				}
				cmd(message.client, message, settings);
			}
		} else {
			cmd(message.client, message, settings);
		}
	} else {
		cmd(message.client, message, settings);
	}

};