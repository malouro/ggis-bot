// This event is for all incoming messages in client channels (servers & channels the bot is in)
// This includes everything needed for AutoReact, chat filters and commands!

const chalk 	= require('chalk');
const Discord 	= require('discord.js');
const fs 		= require('fs');
const moment 	= require('moment-timezone');
const settings  = require('../settings.json');

const setAutoReactions = require('../util/autoreactionsReload');
var   AutoReactions    = setAutoReactions(new Map());

// ----- Text & Keyword detection -----
const RegExExtendedEmojis = /:\w+:(?!\d+>)/g;
const RegExSailorMoon = /[s$]+\s*a+\s*[i1!]+\s*l+\s*[o0]+\s*r+[\W\s_]*m+\s*[o0]+\s*[o0]+\s*n/;
const RegExCollection = [
	/\ball+\s+aboard\b|train!*\b/,
	/\bblazer\b/,
	/d+\s*e+\s*a+\s*d+\s*g+\s*a+\s*m+\s*e|\bdead\s*game\b/,
	/murica|\bamerica\b|\busa\b/,
	/\bmy\sb\b|\bmy\sbad\b|\bmyb\b/,
	/\bno+ice\b/,
	/\bsumol\b|\bforca\b]|\bporkchop\b|\bportugal\b/
];

module.exports = message => {

	/********************************
	 * Initial message filter:
	 * 
	 * 	► Ignore bot-sent messages
	 * 	► Ignore direct messages
	 * 
	 *******************************/

	if (message.author.bot) return;
	if (message.channel.type !== 'text') 
		return message.reply('Sorry, but I don\'t function or react to commands sent through direct messages! Please use my commands in a Discord server. You can @mention me in a server to get a list of commands!');
	let bot = message.client;

	//==================================================================//    
	// CHAT FILTER & AUTO REACTIONS
	// Before checking for commands, check for general chat filter stuff
	//==================================================================//  

	// This only applies for the main guild or the testing guild!
	if (message.guild.id === settings.mainguild || message.guild.id === settings.testguild) {

		// Get an updated settings file (in case rules have been enabled/disabled)
		let settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

		/**
		 * #nosailormoon::
		 * 	Filters mentions of 'sailor moon' in the #nosailormoon text-channel
		 */

		if (message.channel.name === 'nosailormoon' && settings.rules.sailormoon) {
			if (message.toString().toLowerCase().match(RegExSailorMoon)) {
				message.delete().then( () => {
					message.reply("Stop right there, weeb scum. No Sailor Moon in this channel!");
					console.log(chalk.bgMagenta.white(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] Weeb scum ${message.author.username} mentioned "Sailor Moon". Deleted message!`));
				}).catch(console.error);
				return;
			}
		}

		/**
		 * extended emoji::
		 * 	Extends the "Sigg's Testing Ground" server's emoji onto other servers thru the bot
		 * 	Adds extra custom emoji onto our server, in a half-assed sorta way ¯\_(ツ)_/¯
		 */

		if (message.content.toString().match(RegExExtendedEmojis) && settings.rules.extended_emoji.enable && !message.content.startsWith(settings.prefix)) {
			let g = bot.guilds.get(settings.testguild);
			let emojiData = g.emojis;
			let emojiCodes = [];
			let emojis = new Map();
			let edit = false;
			let str = message.content.toString();;
			emojiData.forEach((emoji) => {
				emojis.set(emoji.name, {id: emoji.id, name: emoji.name} );
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
						return;
					}
				}
			}
			// If method (1) was used -->
			if (edit) {
				message.delete().then(msg => {
					if (settings.rules.extended_emoji.embed) {
						let embed = new Discord.RichEmbed()
							.setTitle(`says:`)
							.setDescription(str)
							.setAuthor(msg.author.username, msg.author.displayAvatarURL)
							.setThumbnail(msg.author.displayAvatarURL);
						msg.channel.send({ embed });
					} else {
						msg.channel.send(`\`${msg.author.username}:\`\n${str}`);
					}
				}).catch(err => console.log(err));
			}
		}

		/**
		 * text reactions::
		 * 	Reacts to certain phrases & keywords via RegEx
		 */

		if (settings.rules.autoreact.enable && settings.rules.autoreact.txtmentions && !message.content.startsWith(settings.prefix)) {
			RegExCollection.forEach((regex, index) => {
				if (message.content.toLowerCase().match(regex)) {
					switch (index) {
						case 0: message.react(AutoReactions.get('123977023021514752').emoji[0]); break;
						case 1: message.react(AutoReactions.get('124723727500967936').emoji[0]); break;
						case 2: message.react('☠').then(() => {
							message.react('🎮').then().catch(console.error);
						}).catch(console.error); break;
						case 3: message.react('🇺🇸'); break;
						case 4: message.reply('*my b*', { file: '../images/memes/myb.png' }); break;
						case 5: message.reply('NOICE! https://www.youtube.com/watch?v=rQnYi3z56RE'); break;
						case 6: message.react('🇵🇹');
						default: break;
					}
				}
			});
		}

		/**
		 * @mention automatic reactions::
		 * 	Gets message mentions, looks through AutoReactions for userID and applies a random emoji from the user's emoji list
		*/

		if (settings.rules.autoreact.enable && settings.rules.autoreact.atmentions && message.mentions.users.array().length > 0 && !message.content.startsWith(settings.prefix)) {
			AutoReactions = setAutoReactions(AutoReactions);
			message.mentions.users.forEach(u => {
				if (AutoReactions.has(u.id)) {
					message.react(AutoReactions.get(u.id).emoji[Math.floor(Math.random() * AutoReactions.get(u.id).emoji.length)]).then().catch(e => console.log(e));
				}
			});
		}
	}

	//==================================================================//    
	// COMMANDS
	// Now, we will ignore everything that ISN'T a command and parse
	// the arguments, permissions, etc. etc. for the given command.
	//==================================================================//  

	if (message.content.startsWith(`<@${bot.user.id}>`)) 
		bot.commands.get(`${settings.botname}`) //@pinging triggers help menu
			.run(bot, message, message.content.substring(`<@${bot.user.id}>`.length).split(/ +/), bot.elevation(message));
	if (!message.content.startsWith(settings.prefix)) return; // At this point, ignore non-commands

	//==================================================================//  

	let args = message.content.substring(settings.prefix.length).split(/ +/); // split message into args
	let command = args[0]; // args[0] (aka: the first word after prefix) is the command
	let perms = bot.elevation(message); // get permission level from elevation
	let cmd; // actual command to pass later

	if (bot.commands.has(command)) { // Find the command
		cmd = bot.commands.get(command);
	} else if (bot.aliases.has(command)) { 	// Look in aliases as well
		cmd = bot.commands.get(bot.aliases.get(command));
	}

	if (cmd) {
		if (perms < cmd.conf.permLevel) return; // don't run if permLevel doesn't allow it
		if (cmd.conf.guildOnly && (message.guild.id !== settings.mainguild && message.guild.id !== settings.testguild)) return; // don't run guildOnly commands in guilds other than mainGuild
		if (!cmd.conf.enabled) return; // don't run if it's been disabled
		cmd.run(bot, message, args, perms);
	}
};