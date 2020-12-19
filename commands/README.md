# Commands

Any `*.js` file included within the command category directories are automatically included within the bot. Therefore, to remove or add a command, it's as simple as deleting or creating a new file within here. If you want to exclude a command from your own forked version of Ggis, you can simply delete the file, or [disable it via its `conf` export](#exports-conf).

## Command Structure

Within any given `{command}.js` file, the following values must be exported in order for the command to successfully be included within the bot:

- `help`
- `conf`
- `run`

If any of these are not provided, the bot will fail to start or the command will fail to execute.

These exports are detailed further below

### <a id="exports-help"></a>`exports.help`

This is the information for the `!help` menus related to the command. It expects the following:

```ts
exports.help = {
    name: string, // the command name
    description: string,  // description of the command
    usage: // usage examples
    // this can be a string or a function that returns a string
        string ||
        function(
            bot: Discord.Client,
            message: Discord.Message
        ) => string;
};
```

If your usage examples contain the command prefix in some way (ie: usage: "!help lfg"), switch `usage` to a function & replace the instances of the command prefix with calls from `getGuildCommandPrefix(...)` so that the help menus reflect the given guild's configured command prefix.

eg:

```js
exports.help = {
  name: 'example',
  description: 'Example of using `getGuildCommandPrefix` in a help menu',
  usage: (bot, message) => {
    const prefix = getGuildCommandPrefix(bot, message);

    return `
Examples ::

${prefix}example make a bot 🤖
${prefix}example make good coffee ☕
`.trim();
  }
}
```

### <a id="exports-conf"></a>`exports.conf`

This is the configuration for the given command. Here are the available options for configuration per comamnd:

* **enabled**
  * `boolean`
  * Whether or not the command is able to be used currently. Set to `false` to disable
* **visible**
  * `boolean`
  * Whether the command is visible within help menus
* **guildOnly**
  * `boolean`
  * `true` sets the command to only work within the `mainGuild`
* **textChannelOnly**
  * `boolean`
  * Command will only work in a server text channel (ie: not in a DM with the bot)
* **aliases**
  * `array<string>`
  * List of alternative names to execute the command with
* **permLevel**
  * `number` 
  * Minimum permission level allowed to use the command
  * See perm. level docs in the source code comments within [`handlers/Setup`](https://github.com/malouro/ggis-bot/blob/master/handlers/Setup.js#L66) for more details on what the different permission levels are

### <a id="exports-run"></a>`exports.run`

This is the function that runs and executes the command. It is a void function with the following arguments available:

```ts
exports.run = (
  bot: Discord.Client, // the bot
  message: Discord.Message, // message from command usage
  args: array<string>, // array of command arguments sent by user
  perms: number // permission level of user
) => void
```

## Category Folders

- Debug & Support
- Memes
- Random
- Useful

Commands are automatically assigned to the category associated with the folder and in accordance to the command category configuration designated in the `settings.json` config.

eg:

```js
// settings.json
{
  "commandGroups": [
    {
      "code": [
        "debug",
        "support"
      ],
      // `name` should match up with folder name
      "name": "Debug & Support",
      "description": "Help menus & debug"
    },
    // etc...
  ]
}
```
