// This event is for all incoming messages in client channels (servers & channels the bot is in)
// This includes everything needed for AutoReact, chat filters and commands!

const chalk 		= require('chalk');
const fs 			= require('fs');
const moment 		= require('moment-timezone');
const settings 		= require('../settings.json');
const autoreactions = require('../config/autoreactions.json');
var   AutoReactions = new Map();

// ----- Text & Keyword detection -----
// ExtendedEmojis
const RegExpExtendedEmojis 	= /:\w+:/g;
// AutoReact Text
const RegExpAllAboard 		= /\ball+\s+aboard\b|train!*\b/;
const RegExpBlazer 			= /\bblazer\b/;
const RegExpDeadGame 		= /d+\s*e+\s*a+\s*d+\s*g+\s*a+\s*m+\s*e|\bdead\s*game\b/;
const RegExpMurica 			= /murica|\bamerica\b|\busa\b/;
const RegExpMyB 			= /\bmy\sb\b|\bmy\sbad\b/;
const RegExpNoice 			= /\bno+ice\b/;
const RegExpPorkchop 		= /\bsumol\b|\bforca\b]|\bporkchop\b|\bportugal\b/;
const RegExpSailorMoon 		= /[s$]+\s*a+\s*[i1!]+\s*l+\s*[o0]+\s*r+\s*m+\s*[o0]+\s*[o0]+\s*n/;
// ----- Auto reactions Object -----
autoreactions.autoreactions.forEach(r => {
	AutoReactions.set(r.id, r);
});

module.exports = message => {

	if (message.author.bot) return; // Ignore messages from bot users
	if (message.channel.type !== 'text') return; // Ignore messages from non-text channel sources (aka: DM, group DM, etc)

	// ================================================================== //    
	// CHAT FILTER & AUTO REACTIONS
	// Before checking for commands, check for general chat filter stuff
	// ================================================================== //  

	// This only applies for Christian Mingle guild or the Testing Guild:
	if (message.guild.id === settings.mainguild || message.guild.id === settings.testguild) {

		let settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

		// ==================================================================
		// NO SAILORMOON FILTER
		// ==================================================================

		if (message.channel.name === 'nosailormoon' && settings.rules.sailormoon) {
			if (message.toString().toLowerCase().match(RegExpSailorMoon)) {
				message.reply("Stop right there, weeb scum. No Sailor Moon in this channel!");
				console.log(chalk.bgMagenta.white(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] Weeb scum ${message.author.username} mentioned "Sailor Moon". Deleting message...`));
				message.delete().then(console.log(chalk.bgMagenta.white(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] Done!`))).catch(console.error);
			}
		}

		// ==================================================================
		// TEXT REACTIONS
		// ==================================================================

		if (settings.rules.autoreact.enable && settings.rules.autoreact.txtmentions && !message.content.startsWith(settings.prefix)) {
			// If ALL ABOARD
			if (message.content.toLowerCase().match(RegExpAllAboard)) {
				message.react(AutoReactions.get('123977023021514752').emoji[0]);
			}
			// If BLAZER
			if (message.content.toLowerCase().match(RegExpBlazer)) {
				message.react(AutoReactions.get('124723727500967936').emoji[0]);
			}
			// If DEAD GAME
			if (message.content.toLowerCase().match(RegExpDeadGame)) {
				message.react('☠').then(() => {
					message.react('🎮').then().catch(console.error);
				}).catch(console.error);
			}
			// If 'MURICA
			if (message.content.toLowerCase().match(RegExpMurica)) {
				message.react('🇺🇸');
			}
			// If MY B
			if (message.content.toLowerCase().match(RegExpMyB)) {
				message.reply('*my b*',{file: '../images/memes/myb.png'});
			}
			// If NOICE
			if (message.toString().toLowerCase().match(RegExpNoice)) {
				message.reply('NOICE! https://www.youtube.com/watch?v=rQnYi3z56RE');
			}
			// If PORKCHOP
			if (message.toString().toLowerCase().match(RegExpPorkchop)) {
				message.react('🇵🇹');
			}
		}

		// ==================================================================
		// EXTENDED EMOJI EXAMPLE
		// ==================================================================

		// As reactions:
		if (message.content.toString().match(RegExpExtendedEmojis)) {
			fs.readFile('./config/emojis.json', 'utf8', (err, data) => {
				if (err) throw err;
				else {
					var emojis = JSON.parse(data);
					let str = message.content.toString();
					let emojiCodes = [];
					while ((emojiCodes = RegExpExtendedEmojis.exec(str)) !== null) {
						let emoji = emojiCodes[0].toString().slice(1, emojiCodes[0].length - 1);
						emojis.emojis.forEach(e => {
							if (emoji === e.code) {
								message.react(e.id).then().catch(err => console.log(err));
							}
						});
					}
				}
			});
		}

		// ==================================================================
		// @ MENTION REACTIONS
		// ==================================================================

		if (settings.rules.autoreact.enable && settings.rules.autoreact.atmentions && message.mentions.users.array().length > 0 && !message.content.startsWith(settings.prefix)) {
			message.mentions.users.forEach(u => {
				if (AutoReactions.has(u.id)) {
					message.react(AutoReactions.get(u.id).emoji[Math.floor(Math.random() * AutoReactions.get(u.id).emoji.length)]).then().catch(e => console.log(e));
				}
			});
		}
	}

	// ==================================================================
	// 	COMMANDS
	// ==================================================================

	if (!message.content.startsWith(settings.prefix)) return; // At this point, ignore non-commands

	let bot = message.client; // get Client from message
	let args = message.content.substring(settings.prefix.length).split(/ +/); // split message into args
	let command = args[0]; // args[0] (aka: the first word) is the command
	let perms = bot.elevation(message); // get permission level from elevation
	let cmd; // actual command to pass later

	if (bot.commands.has(command)) { // Find the command
		cmd = bot.commands.get(command);
	} else if (bot.aliases.has(command)) { 	// Look in aliases as well
		cmd = bot.commands.get(bot.aliases.get(command));
	}

	// If something was found, run the command!
	if (cmd) {
		if (perms < cmd.conf.permLevel) return; // don't run if permLevel doesn't allow it
		if (cmd.conf.guildOnly && (message.guild.id !== settings.mainguild && message.guild.id !== settings.testguild)) return; // don't run guildOnly commands in guilds other than mainGuild
		if (!cmd.conf.enabled) return; // don't run if it's been disabled
		cmd.run(bot, message, args, perms);
	}
};