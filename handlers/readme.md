## Ggis Handlers

This directory contains core modules that get accessed across several commands, events, etc.

| File                  | Description                                     |
| --------------------- | ----------------------------------------------- |
| Setup                 | Start up file that sets up everything           |
| EventLoader           | Ties JavaScript to eventListeners<br>(ie: message, guildCreate, channelDelete, etc)|
| ReloadCommands        | Reloads required files for all commands         |
| ReloadLFG             | reloads the LFG game library                    |
| LFGHandler            | For use with LFG commands/events                |
| PollHandler           | For use with creating polls/petitions           |
| SpoilerHandler        | For use with the spoiler command                |
| StreamLinkHandler     | For use with StreamLink commands/events         |
