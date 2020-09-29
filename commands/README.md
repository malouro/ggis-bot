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

### <a id="exports-conf"></a>`exports.conf`

### <a id="exports-run"></a>`exports.run`

## Category Folders

- Debug & Support
- Memes
- Random
- Useful