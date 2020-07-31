# Ggis-bot

[![CircleCI](https://circleci.com/gh/malouro/ggis-bot.svg?style=svg)](https://circleci.com/gh/malouro/ggis-bot)

## Introduction

Ggis-bot was a small, personal summer project that escalated into something a little bigger. Originally designed to be used for a private Discord server among friends, Ggis sports some pretty useful (as well as some pretty *useless*) features that help keep us entertained to this day.

## The $%&# is a "Ggis"?

My Discord username is Sigg.

Ggis is Sigg backwards.

Yep, there you go.

## Features & Commands

- **StreamLink** : Pushes notifications when linked users go live on Twitch.tv
- **LFG** : "Looking for group" helps you find people to play a game with you
- **AutoReact** : Automatic emoji reactions or message replies when specified users get @mentioned or when specific phrases are said
- Programmable **chat filters**
- Fetch random posts from any of Reddit's subreddits
- Open up fortune cookies, random Key & Peele videos, and other useless & silly commands

Use the `!help` command to get a full list of commands.

## Installation & Setup

### Requirements

- [Latest Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/) - Alternatively, you can just use `npm`

### Getting set up

Firstly, you need a Discord development app and its corresponding OAuth token ready. Here's how to do this:

1. Navigate to [https://discordapp.com/developers/docs/intro](https://discordapp.com/developers/docs/intro), log in with your Discord account and access the **My Apps** page
2. Under the **Bot** section, hit **Create a Bot User**
3. Click **click to reveal** for the bot's token and *save this token for later use!*
4. At the top of the page, under **App details** there should be a **Client ID**. We'll need this soon!
5. (Feel free to edit any other preferences for your bot while you're here on this page, because we're about to navigate away from it.)
6. Click **Save Changes** to save your bot's information.
7. Paste the following URL into your browser, but replace **INSERT_CLIENT_ID_HERE** with your Client ID from step 4: `https://discordapp.com/oauth2/authorize?client_id=INSERT_CLIENT_ID_HERE&scope=bot&permissions=523762774`<br>This will invite your bot into a server of your choice! (Note: You need to have the 'Manage server' permission on the server you wish to invite the bot into.)

Run the following command in a command prompt within the project directory:

```bash
yarn setup
# or
npm run setup
```

During this setup script, you will be asked a series of configuration questions. Make sure you have your OAuth token ready for this part, as you will be prompted for it.

### Start the bot

```bash
yarn start
# or
npm start
```

There! Now Ggis should be up and running. 👍
