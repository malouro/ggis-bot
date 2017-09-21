/*
	app: Discord Bot 'Ggis'
	author: Michael A. Louro
	info: /What is Ggis?/
	+ Originally designed as a bot for use in the "Christian Mingle" Discord server.
	+ Features certain chat filter features, automatic emoji reaction to certain messages,
	  and notifications for connected member's Twitch accounts (for when they go live) & more.
	+ Commands include: !fortune, !streamlink, !lfg, !aww, etc.
	+ Ggis is a Discord bot that serves both as a fun and useful tool for our server.
*/

// Required modules:
const chalk 	= require('chalk');
const Discord	= require('discord.js');
const fs		= require('fs');
const moment	= require('moment-timezone');
const schedule 	= require('node-schedule');
const TwitchPS 	= require('twitchps');

const bot 		= new Discord.Client(); 	// create bot's Discord Client
bot.commands 	= new Discord.Collection(); // all commands are stored within the Client here
bot.aliases 	= new Discord.Collection(); // all aliases for commands
bot.streamLink  = new Discord.Collection();	// all StreamLink settings are loaded into here
bot.games 		= new Discord.Collection(); // collection of LFG games
bot.gameAliases = new Discord.Collection(); // all aliases for LFG games
bot.lfgStack 	= new Discord.Collection(); // ongoing LFG parties are in here
bot.polls 		= new Discord.Collection(); // all active polls / petitions

var eventHandlers  = ['streamlinkHandler', 'lfgHandler', 'pollHandler']; // The event handlers list
var eventLoader    = require('./util/eventLoader')(bot); // Client events
var streamlink 	   = require('./util/streamlinkHandler'); // StreamLink event handler
var lfg 		   = require('./util/lfgHandler'); // LFG event handler
var polls 		   = require('./util/pollHandler'); // Polls event handler

const slFunc 	   = require('./commands/streamlink');
const lfgFunc 	   = require('./commands/lfg');
const pollFunc 	   = require('./commands/poll');

const settings 	   = JSON.parse(fs.readFileSync("./settings.json", "utf8")); // Bot config JSON
const settingsSL   = JSON.parse(fs.readFileSync("./config/streamlink.json", "utf8")); // StreamLink saved info
const settingsSLMG = JSON.parse(fs.readFileSync("./config/streamlink_multiguild.json", "utf8")); // StreamLink multi-guild, user & server info

const initTopics   = [{ topic: "video-playback.channel" }]; // TwitchPS requires a non-empty intial topic list
const twitch 	   = new TwitchPS({ init_topics: initTopics, reconnect: false, debug: false });

// -------------------------------------------------

// Debug info on startup:
console.log(chalk.bgBlue.bold(`STARTING 'bot.js' ...`));
console.log(chalk.bgBlue(`${settings.botnameproper} is connected to ${settings.guilds.length} guilds currently.`));
console.log(chalk.bgBlue(`Guilds connected to: { ${settings.guilds} }`));

// -------------------------------------------------
// 					  Commands
// -------------------------------------------------

// Load commands from ./commands/ dir, add into Client
fs.readdir('./commands', (err, files) => {
	if (err) console.error(err);
	console.log(chalk.bgBlue(`Loading a total of ${files.length} commands.`));
	files.forEach(f => {
		let contents = require(`./commands/${f}`);
		console.log(chalk.bgCyan.black(`Loading command ... ${contents.help.name} ✓`));
		bot.commands.set(contents.help.name, contents);
		contents.conf.aliases.forEach(alias => {
			bot.aliases.set(alias, contents.help.name);
		});
	});
});

// Reload command(s) (!reload)
bot.reload = command => {
	return new Promise((resolve, reject) => {
		try {
			if (command) {
				delete require.cache[require.resolve(`./commands/${command}`)];
				let cmd = require(`./commands/${command}`);
				bot.commands.delete(command);
				bot.aliases.forEach((cmd, alias) => {
					if (cmd === command) bot.aliases.delete(alias);
				});
				bot.commands.set(command, cmd);
				cmd.conf.aliases.forEach(alias => {
					bot.aliases.set(alias, cmd.help.name);
				});
				// Resort command list:
				var keys = [];
				var sorted = new Discord.Collection();
				bot.commands.forEach((value, key, map) => {
					keys.push(key);
				});
				keys.sort().map((key) => {
					sorted.set(key, bot.commands.get(key));
				});
				bot.commands = sorted;
				resolve();
			} else {
				bot.commands.forEach(command => {
					delete require.cache[require.resolve(`./commands/${command.help.name}`)]
				});
				bot.aliases.clear();
				bot.commands.clear();
				fs.readdir('./commands', (err, files) => {
					if (err) console.error(err);
					files.forEach(f => {
						let contents = require(`./commands/${f}`);
						console.log(chalk.bgCyan.black(`Loading command ... ${contents.help.name} ✓`));
						bot.commands.set(contents.help.name, contents);
						contents.conf.aliases.forEach(alias => {
							bot.aliases.set(alias, contents.help.name);
						});
					});
				});
				resolve();
			}
		} catch (err) {
			reject(err);
		}
	});
};

// Reload event file(s) (!reloadevent)
const reloadEvents = () => {
	return new Promise((resolve, reject) => {
		try {
			eventHandlers.forEach(file => {
				delete require.cache[require.resolve(`./util/${file}`)];
			});
			streamlink = require(`./util/streamlinkHandler`);
			lfg = require(`./util/lfgHandler`);
			polls = require(`./util/pollHandler`);
			slFunc.reloadHandler()
			.then(lfgFunc.reloadHandler()
				.then(pollFunc.reloadHandler()
					.then()
					.catch(err => console.log(err)))
				.catch(err => console.log(err)))
			.catch(err => console.log(err));
			resolve();
		} catch (err) {
			reject(err);
		}
	});
};

// Permission levels passed thru message to regulate command use
bot.elevation = message => {
	/********************************************* 
	Assign a permission level based on user role
	Determines the elligble commands for the user
	   ╔permLevel═╦═Role═════════════╗
	   ║0		  ║	@everyone		║
	   ║1		  ║	---				║
	   ║2		  ║	Admins			║
	   ║3		  ║	Server Owners	║
	   ║4		  ║	Master			║
	   ╚═══════════╩══════════════════╝		
	*********************************************/
	let permlvl = 0; // @everyone
	if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 2; // Server admin
	if (message.member === message.guild.owner) permlvl = 3; 	   // Server owner
	if (message.author.id === settings.masterID) permlvl = 4;     // Bot owner ID, purely for debugging commands
	return permlvl;
};

// -------------------------------------------------
// 					 StreamLink
// -------------------------------------------------

// Load in StreamLink settings into Client >> "settings" => {...}
bot.streamLink.set("settings", {
	guilds: settingsSL.guilds,
	channels: settingsSL.channels,
	users: settingsSL.userIDs,
	userNames: settingsSL.userNames,
	twitchChannels: settingsSL.topics,
	defaultTimer: settings.streamlink.timer
});

// Load in user settings for StreamLink into Client >> "#userid" => {...}
settingsSL.topics.forEach((topic, index) => {
	if (index === 0) console.log(chalk.bgMagenta.bold(`StreamLink connections:`));
	twitch.addTopic([{ topic: `video-playback.${topic}` }]);
	bot.streamLink.set(settingsSL.userIDs[index], {
		id: settingsSL.userIDs[index],
		isUser: true,
		userName: settingsSL.userNames[index],
		twitchChannel: topic,
		status: settingsSL.stream_status[index],
		lastBroadcast: settingsSL.last_broadcast[index],
		game: settingsSL.stream_game[index],
		viewerCount: 0
	});
	console.log(chalk.bgMagenta(`User: ${bot.streamLink.get(settingsSL.userIDs[index]).userName} => Stream: https://www.twitch.tv/${bot.streamLink.get(settingsSL.userIDs[index]).twitchChannel}`));
});

// Load in guild settings for StreamLink into Client >> "#guildid" => {...}
settingsSLMG.guilds.forEach((guild, index) => {
	bot.streamLink.set(guild.id, {
		id: guild.id,
		isGuild: true,
		guildEnable: guild.guild_enable,
		usersEnable: guild.users_enable,
		banList: guild.ban_list
	});
	console.log(chalk.bgMagenta.black(`Guild: ${bot.streamLink.get(settingsSLMG.guilds[index].id).id} => Enabled?: ${bot.streamLink.get(settingsSLMG.guilds[index].id).guildEnable}, Users: ${bot.streamLink.get(settingsSLMG.guilds[index].id).usersEnable}`));
});

// -------------------------------------------------
// 						LFG
// -------------------------------------------------

// Load games for LFG, from ./lfg/ dir, put it in the BOT client!
fs.readdir('../lfg', (err, files) => {
	if (err) console.error(err);
	console.log(chalk.bgYellow.black(`Loading a total of ${files.length} games into Games Collection.`));
	files.forEach(f => {
		let contents = require(`../lfg/${f}`);
		console.log(chalk.bgYellow.gray(`Loading game ... ${contents.name}`));
		bot.games.set(contents.code, contents);
		contents.aliases.forEach(alias => {
			bot.gameAliases.set(alias, contents.code);
		});
	});
});

// Reload LFG games
bot.reloadLFG = game => {
	return new Promise((resolve, reject) => {
		try {
			if (game === 0) { // If no game specified, reset all LFG games
				bot.games.forEach(g => {
					if (typeof require.cache[require.resolve(`../lfg/${g.code}`)] != 'undefined')
						delete require.cache[require.resolve(`../lfg/${g.code}`)]
				})
				bot.games.clear();
				console.log(chalk.bgYellow.bold.black(`RELOADING LFG GAMES:`));
				fs.readdir('../lfg', (err, files) => {
					if (err) console.error(err);
					console.log(chalk.bgYellow.black(`Loading a total of ${files.length} games into Games Collection.`));
					files.forEach(f => {
						let contents = require(`../lfg/${f}`);
						console.log(chalk.bgYellow.gray(`Loading game ... ${contents.name}`));
						bot.games.set(contents.code, contents);
						contents.aliases.forEach(alias => {
							bot.gameAliases.set(alias, contents.code);
						});
					});
				});
			} else {
				delete require.cache[require.resolve(`../lfg/${game}`)];
				let g = require(`../lfg/${game}`);
				bot.games.delete(game);
				bot.aliases.forEach((g, alias) => {
					if (g === game) bot.gameAliases.delete(alias);
				});
				bot.games.set(game, g);
				g.aliases.forEach(alias => {
					bot.gameAliases.set(alias, g.code);
				});

				// Reorder games alphabetically 
				// (otherwise, the updated game will just get pushed to bottom of list)
				let keys = [];
				let sorted = new Discord.Collection();
				bot.games.forEach((value, key, map) => {
					keys.push(key);
				});
				keys.sort().map((key) => {
					sorted.set(key, bot.commands.get(key));
				});
				bot.games = sorted;
			}
			resolve();
		} catch (err) {
			reject(err);
		}
	});
};

// Continuous update & check of LFG stack, performed every 5s:
const lfgUpdateInterval = setInterval(async function () {
	if (bot.lfgStack.size > 0) {
		var d = new Date();
		bot.lfgStack.forEach(l => {
			if (d.getTime() >= l.time + (l.ttl * 60000)) { // check if LFG's have timed out
				lfg.timeout(bot, l.id);
			}
			else if (l.ttl >= settings.lfg.ttl_threshold && l.time + (l.ttl * 60000) - d.getTime() <= Math.round(l.ttl * 60000 / 4) && !l.warning && settings.lfg.ttl_warning) { // check if LFG's are running out of time
				let timeleft = Math.round(Math.round(l.ttl * 60000 / 4) / 60000);
				lfg.warning(bot, l.id, timeleft);
			}
		});
	}
}, 5000);

// -------------------------------------------------
// 				  TwitchPS Events:
// -------------------------------------------------

// Detect when a stream goes live
twitch.on('stream-up', (data) => {
	streamlink.streamUp(bot, data);
});

// Detect when a stream goes down
twitch.on('stream-down', (data) => {
	streamlink.streamDown(bot, data);
});

// Updates on viewer count
twitch.on('viewcount', (data) => {
	streamlink.viewCount(bot, data);
});

// Add a topic to watch in TwitchPS
const addTwitchTopic = (stream) => {
	twitch.addTopic({ topic: `video-playback.${stream.toLowerCase()}` });
}

// Remove topic from TwitchPS
const removeTwitchTopic = (stream) => {
	twitch.removeTopic({ topic: `video-playback.${stream.toLowerCase()}` });
}

// -------------------------------------------------
// Miscellaneous & extra functions
// -------------------------------------------------

// Bot's pulse "Are you still there?"
// Log the app's average Discord latency every 10 minutes
const botPulse = setInterval(async function () {
	console.log(chalk.bgBlue(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ♥ Heartbeat ... ${Math.round(bot.ping)} ms`))
}, 10 * 60000)

// Scheduled weekly event -- Every Sunday at 12:00AM EST!
const weeklyScheduler = schedule.scheduleJob('0 0 5 * * 0', function () {
	console.log(chalk.bgBlue.white(`The week has come to a close... Time to post some weekly stats!`));
	// WORK IN PROGRESS! -- to be used for 'reaction stats' and/or other stats?
});

// Post LFG stack
const lfgTest = (message) => {
	message.reply(`${bot.lfgStack.map(e => JSON.stringify(e, 'utf8'))}`);
};

// Post StreamLink objects
const slTest = (message) => {
	message.reply(`${bot.streamLink.map(e => JSON.stringify(e, 'utf8'))}`);
};

// -------------------------------------------------

// Exported functions:
exports.reloadEvents 		= reloadEvents;
exports.addTwitchTopic 		= addTwitchTopic;
exports.removeTwitchTopic 	= removeTwitchTopic;
exports.lfgTest 			= lfgTest;
exports.slTest 				= slTest;

// -------------------------------------------------
bot.login(settings.token); // Login with auth token
// -------------------------------------------------