/**************************************************************************
 *  @name	Ggis-bot
 *	@author	Michael A. Louro
 *	@version 1.3.02 Last edit: October 15, 2017
 *
 *************************************************************************/


/**************************************************************************
 * Declare & initialize vars, constants, configs & modules
 * 
 **************************************************************************/
// npm modules
const chalk 	= require('chalk');
const Discord 	= require('discord.js');
const fs 		= require('fs');
const moment 	= require('moment-timezone');
const schedule  = require('node-schedule');
const TwitchPS  = require('twitchps');

// Discord.js Client & Collections to use later
const bot 		  = new Discord.Client(); // create bot's Discord Client
bot.commandGroups = new Discord.Collection(); // all command categories/groups names
bot.commandGC 	  = new Discord.Collection(); // all command category codes
bot.commands 	  = new Discord.Collection(); // all commands are stored within here
bot.aliases 	  = new Discord.Collection(); // all aliases for commands
bot.streamLink 	  = new Discord.Collection(); // all StreamLink settings are loaded into here
bot.games 	   	  = new Discord.Collection(); // collection of LFG games
bot.gameAliases   = new Discord.Collection(); // all aliases for LFG games
bot.lfgStack 	  = new Discord.Collection(); // ongoing LFG parties are in here

// JSON configs to read from
const settings 	   = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
const settingsSL   = JSON.parse(fs.readFileSync("./config/streamlink.json", "utf8"));
const settingsSLMG = JSON.parse(fs.readFileSync("./config/streamlink_multiguild.json", "utf8"));

// List of event handlers, reloaders, etc. etc. (needed for event reloading & command reloading later)
var eventLoader   = require('./util/eventLoader')(bot),
	eventHandlers = [], functionsToReload = [], lfgUpdateContainer = null;

/**************************************************************************
 * Start up the bot!!
 * 
 **************************************************************************/
console.log(chalk.bgBlue.bold(`STARTING 'bot.js' ...`));
console.log(chalk.bgBlue(`${settings.botnameproper} is connected to ${settings.guilds.length} guilds currently.`));
console.log(chalk.bgBlue(`Guilds connected to: { ${settings.guilds} }`));

// Pre-loading; setting things up
// -------------------------------------------------

/**************************************************************************
 * Things that get pre-loaded:
 * @var {Collection} bot.commandGroups, (bot.commandGC)
 * @var {Collection} bot.commands, (bot.aliases)
 * @var {Array[]} eventHandlers,
 * @var {Array[]} functionsToReload,
 * @var {Array[]} reloaders,
 * @var {Collection} bot.streamLink, //includes all saved StreamLink info
 * @var {Collection} bot.games, (bot.gameAliases) // for LFG use
 * 
 **************************************************************************/

// Get command categories (directories in /commands/)
settings.commandGroups.forEach(category => {
	category.code.forEach(code => { bot.commandGC.set(code, category.name);	});
	bot.commandGroups.set(category.name, category);
});

// Load commands from each folder in /commands/ dir, add into Client bot
fs.readdir('./commands/', (err, folders) => {
	folders.forEach(folder => {
		fs.readdir(`./commands/${folder}`, (err, files) => {
			if (err) throw err;
			console.log(chalk.bgBlue(`Loading a total of ${files.length} commands from /${folder}/`));
			files.forEach(f => {
				let contents = require(`./commands/${folder}/${f}`);
				console.log(chalk.bgCyan.black(`Loading command ${contents.help.name} ... ✓`));
				bot.commands.set(contents.help.name, contents);
				bot.commands.get(contents.help.name).conf.category = `${folder}`;
				contents.conf.aliases.forEach(alias => {
					bot.aliases.set(alias, contents.help.name);
				});
			});
		});
	})
});

// Create list of eventHandler files (from handlerNames list)
settings.eventHandlers.forEach((event, index) => {
	eventHandlers.push(null);
	eventHandlers[index] = require(`./util/${event}`);
});

// Create list of function files (command files that need to be updated when an eventHandler is altered)
settings.functionsToReload.forEach((func, index) => { // Link to commands that need to have handlers reloaded
	functionsToReload.push(null);
	if (bot.commands.has(func)) {
		let cat = bot.commands.get(func).conf.category;
		functionsToReload[index] = require(`./commands/${cat}/${func}`);
	}
});

// Permission levels passed thru message to regulate command use
bot.elevation = message => {
	/*********************************************
	Assign a permission level based on user role
	Determines the elligble commands for the user,
	and other permission level access within
	commands & command options.
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
	if (message.member === message.guild.owner) permlvl = 3; // Server owner
	if (message.author.id === settings.masterID) permlvl = 4; // Bot owner ID, purely for debugging commands
	return permlvl;
};

// StreamLink setup ::
const twitch = new TwitchPS({ init_topics: [{ topic: "video-playback.channel" }], reconnect: false, debug: false });

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
	twitch.addTopic([{ topic: `video-playback.${topic}`	}]);
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

// Load games for LFG, from ./lfg/ dir, put it in the BOT client!
fs.readdir('./lfg', (err, files) => {
	if (err) console.error(err);
	console.log(chalk.bgYellow.black(`Loading a total of ${files.length} games into Games Collection.`));
	files.forEach(f => {
		let contents = require(`./lfg/${f}`);
		console.log(chalk.bgYellow.gray(`Loading game ... ${contents.name}`));
		bot.games.set(contents.code, contents);
		contents.aliases.forEach(alias => {
			bot.gameAliases.set(alias, contents.code);
		});
	});
});

// Automatic update for LFG (every 5s by default) (interval is clearable & resettable!)
bot.lfgUpdate = function (flag, interval) {
	if (flag) lfgUpdateContainer = setInterval( function() {eventHandlers[1].update(bot)}, interval);
	else clearInterval(lfgUpdateContainer);
}

// Re-loading: refreshing to incorporate changes
// -------------------------------------------------

/**************************************************************************
 * Things that get re-loaded:
 * @var {Collection} bot.commands, (via /util/commandsReload)
 * @var {Collection} bot.games, (via /util/lfgReload)
 * @var {Array[module]} eventHandlers,
 * @var {Array[module]} functionsToReload,
 * @var {Array[]} settings.reloaders,
 * 
 **************************************************************************/

bot.commandsReload = require('./util/commandsReload'); // Reload command(s) (!reload)
bot.lfgReload 	   = require('./util/lfgReload'); // Reload LFG games (!reloadlfg)
bot.reloadEvents = () => { // Reload event files (!reloadevents)
	return new Promise((resolve, reject) => {
		try {
			settings.eventHandlers.forEach((file, index) => {
				delete require.cache[require.resolve(`./util/${file}`)];
				eventHandlers[index] = require(`./util/${file}`);
				if (bot.commands.has(settings.functionsToReload[index])) {
					let cat = bot.commands.get(settings.functionsToReload[index]).conf.category;
					functionsToReload[index] = require(`./commands/${cat}/${settings.functionsToReload[index]}`);
					functionsToReload[index].reloadHandler().then().catch(err => console.log(err));
				}
			});
			settings.reloaders.forEach(file => {
				delete require.cache[require.resolve(`./util/${file}`)];
				bot[`${file}`] = require(`./util/${file}`);
			});
			resolve();
		} catch (err) {
			reject(err);
		}
	});
};

// TwitchPS events (for StreamLink)
// -------------------------------------------------

/**************************************************************************
 * These are all the functions that need to be monitored for StreamLink
 * 
 * 	(StreamLink handler func) <--> (TwitchPS event)
 *  @func streamUp <--> 'stream-up'
 * 		@param {Object} data : Contains {Integer time, String channel_name }
 *  @func streamDown <--> 'stream-down'
 * 		@param {Object} data : Contains {Integer time, String channel_name }
 *  @func viewCount <--> 'viewcount'
 * 		@param {Object} data : Contains {Integer time, String channel_name, Integer viewers }
 * 
 * And here are functions that get exported to StreamLink handler
 * 
 *  @func addTwitchTopic @param {String} stream : String (stream) in http://www.twitch.tv/(stream)
 * 
 *************************************************************************/

twitch.on('stream-up', 	 data => {	if (settings.streamlink.enable) eventHandlers[0].streamUp(bot, data);});
twitch.on('stream-down', data => {	if (settings.streamlink.enable) eventHandlers[0].streamDown(bot, data);});
twitch.on('viewcount', 	 data => {	if (settings.streamlink.enable) eventHandlers[0].viewCount(bot, data);});
exports.addTwitchTopic    = stream => {	twitch.addTopic	({topic: `video-playback.${stream.toLowerCase()}`}); }
exports.removeTwitchTopic = stream => {	twitch.removeTopic({topic: `video-playback.${stream.toLowerCase()}`}); }

// Miscellaneous / work in progress
// -------------------------------------------------

//#region Coming soon™?
/* -------------------------------------------------

var weeklyScheduler = schedule.scheduleJob('0 0 0 * * 0', function () { // Scheduled weekly event -- Every Sunday at 12:00AM EST!
	console.log(chalk.bgBlue.white(`The week has come to a close... Time to post some weekly stats!`));
	// WORK IN PROGRESS! -- to be used for 'reaction stats' and/or other stats?
});

//#endregion
*/

// -------------------------------------------------
bot.login(settings.token); // Login with auth token
// -------------------------------------------------