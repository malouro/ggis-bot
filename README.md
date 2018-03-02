# Intro

Ggis-bot was a small, personal summer project that escalated into something a little bigger. Originally designed to be used for a private Discord server among friends, Ggis sports some pretty useful (as well as some pretty *useless*) features that help keep us entertained to this day.

### The $%&# is a "Ggis"?

My Discord username is Sigg.

Ggis is Sigg backwards.

Yep, there you go.

### Features & Commands

- **StreamLink** : Pushes notifications when linked users go live on Twitch.tv
- **LFG** : "Looking for group" helps you find people to play a game with you
- **AutoReact** : Automatic emoji reactions or message replies when specified users get @mentioned or when specific phrases are said
- Programmable **chat filters**
- Fetch random posts from any of Reddit's subreddits
- Open up fortune cookies, Random Jaden Smith Tweets, Key & Peele videos, and other useless & silly commands

Use the `!help` command to get a full list of commands.

# Insallation & Setup

### Requirements

- Node.js

### Getting set up

> Todo: Do a trial run of a user's first time setup

Firstly, you need a Discord development app and its corresponding OAuth token ready.

- Navigate to [https://discordapp.com/developers/docs/intro](https://discordapp.com/developers/docs/intro), log in with your Discord account and access the **My Apps** page
- Under the **Bot** section, hit **Create a Bot User**
- Click **click to reveal** for the bot's token and *save this token for later use!*
- (Feel free to edit any preferences for your bot while you're here on this page)
> Todo: add how to invite bot into your server here
- Click **Save Changes** and be on your way

Then, run the following command within the project directory:

```bash
npm run setup
```

After `npm run setup`, you will be asked a series of configuration questions. Make sure you have your OAuth token ready for this part, as you will be prompted for it.

### Start the bot

```bash
npm start
```

There! Now Ggis should be up and running. 👍
