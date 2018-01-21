# Handlers

This directory contains core modules that get accessed across several commands, events, etc.

## Table of Contents

| File                  | Description                                     |
|:----------------------|-------------------------------------------------|
| Setup                 | Start up file that sets up everything           |
| EventLoader           | Ties JavaScript to eventListeners<br>(ie: message, guildCreate, channelDelete, etc)|
| LFGHandler            | For use with LFG commands/events                |
| PollHandler           | For use with creating polls/petitions           |
| SpoilerHandler        | For use with the spoiler command                |
| StreamLinkHandler     | For use with StreamLink commands/events         |
| ReloadCommands        | Reloads required files for all commands         |
| ReloadLFG             | reloads the LFG game library                    |

## Setup

As implied by the name, this code is executed at start up from the main `app.js` file and serves as the main entry point for the bot.

Below is a list of things that get executed at this stage:

- Collections are made for commands, command categories, LFG games, StreamLink configuration data, and aliases needed for any of these.
- EventLoader gets ran and is passed with the Client
- Embedded functions within the Client are initialized at this point.<br>Includes: `getPerms`, `reloadCommands`, `reloadLFG`, `reloadHandlers`, and `lfgUpdate`
  > Note: Eventually, a `reloadEvents` function will also be instantiated here, but for now this is a work in progress while I figure some stuff out

## EventLoader

Here, any events that the Client (our bot) needs to listen to are defined. By tying these event emitters to functions within our `~/events/` directory, we can control how the bot will handle incoming messages, emoji reactions, creation or deletion of channels & guilds, etc, etc.

Table of events the Client listens to:

|Event|Description & info|
|:----|------------------|
|`ready`|When the bot first establishes a connection to Discord|
|`reconnecting`|When reconnecting is required|
|`disconnect`|When the bot disconnects from Discord|
|`message`|When a message is sent into a channel or server the bot is located on|
|`messageDelete`|When a message (that was previously observed by the `message` event above) is deleted. Important for the use of LFG |
|`messageReactionAdd`|When an emoji reaction is added to a message (that was previously observed by the `message` event above). This is needed for LFG (and possibly Polls in the future)|
|`messageReactionRemove`|When an emoji reaction is removed from a message (that was previously observed by the `message` event above)|
|`guildCreate`|When the bot joins a server/guild|
|`guildDelete`|When the bot leaves a server/guild|
|`guildMemberRemove`|When a user leaves a server/guild the bot is located on. Needed for handling Squads & StreamLink configurations|
|`channelDelete`|When a text/voice channel is deleted on a server/guild the bot is located on. Needed for StreamLink server configurations|

**References:**

- Check out the Discord.js docs [here](https://discord.js.org/#/docs/main/stable/class/Client) for more info on Events.

## LFGHandler

All `!lfg` related events are handled in here.

**Definitions & general format:**

`bot.games` is the collection of LFG games the bot has (taken directly from the collection of .json files in ~/config/lfg/), and they each follow the format below:

```json
// LFG Game format
{
    "code": "Name for command use (!lfg [code])",
    "name": "Proper formatted title",
    "aliases": ["array of alternative ways to issue the command"],
    "thumbnail": "URL to a thumbnail image",
    "default_party_size": [4],
    "modes": ["any","game","modes","you","want"],
    "modes_proper": ["Any","game","modes","You","want!"],
    "default_game_mode": "any"
}
// Keep in mind:
// 1. Don't include spaces in any of the above, except 'name' & 'modes_proper'
// 2. 'default_party_size', 'modes', and 'modes_proper' are arrays that *must* be of the same length
// 3. 'default_game_mode' *must* correspond to any item from 'modes'
// 4. 'thumbnail' is always a URL
```

`bot.gameAliases` contains mapping information for every alias defined within these LFG .json configs that specifies what game each is connected to.

Each LFG request that gets passed from the main `!lfg` command file to the LFGHandler, follows this format:

```js
/** Taken directly from /commands/Useful/lfg.js */

let lfgObject = {
  id: '', // the message ID of the LFG party request that goes out
  party_leader_name: message.author.username, // username of party leader
  party_leader_id: message.author.id, // ID of party leader
  code: game.code, // code to identify the game within bot.games
  game: game.name, // name of the game
  mode: game.modes[j], // code of the game mode
  time, // current time
  expire_date: expireDate, // time of expiration
  ttl, // time to live
  party: [message.author.id], // array of current party members (by their IDs)
  max_party_size: partySize, // max size of party
  channel: message.channel.id, // channel message was sent in
  warning: false, // has a warning on the expiration time been sent yet?
};
```

**Functions:**

|Func|Parameters|Description|
|:---|----------|-----------|
|`addLFG`| `Discord.Client` bot<br>`object` obj (follows format above) | Creates a new LFG party |
|`addToParty`| `Discord.Client` bot<br>`Snowflake` id<br>`Snowflake` userid | 

> todo: Need to add the rest of the LFG functions here

## ReloadCommands

This script is ran to update any command(s) in real time. If changes need to be made to a command, it is not necessary to restart the whole app--just run `!reload [command]`

If a `[command]` argument is not provided, *all* the bot's commands will be reloaded.

## ReloadLFG

This script is will reload any updates made to the LFG library--that is, any of the .json config files within the `~/config/lfg/` directory.

Executed from `!reloadlfg [game]`

If a `[game]` argument is not provided, *all* of the games in the LFG library will be reloaded.

> todo: Document the other handlers