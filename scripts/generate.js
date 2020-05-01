/**
 * Setup Script
 *  - Creates setting.json file (given user input)
 *  - Creates blank atReaction, and txtReaction.json files
 */

const readline = require('readline');
const chalk = require('chalk');
const fs = require('fs');

const json = JSON.parse(fs.readFileSync('settings.template.json', 'utf8'));
const regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/;
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const writeFiles = (settingsObj, reactionsObj) => {
  console.log('\n');
  // Write `settings.json`
  fs.writeFile('settings.json', JSON.stringify(settingsObj, null, 2), (err) => {
    if (err) {
      console.log(chalk.bgRed.black('FAILED'), ' Writing settings.json', `\n${err}`);
    } else {
      // SUCCESS settings.json
      console.log(chalk.bgGreen.black('SUCCESS'), ' Writing settings.json');
      // create backup file
      fs.writeFile('settings.backup.json', JSON.stringify(settingsObj, null, 2), (errOnBackup) => {
        if (errOnBackup) {
          console.log(chalk.bgRed.black('FAILED'), ' Writing settings.backup.json', `\n${errOnBackup}`);
        } else {
          console.log(chalk.bgGreen.black('SUCCESS'), ' Writing settings.backup.json');
        }
      });
    }

    /** Write `atReactions.json` */
    fs.writeFile('./config/atReactions.json', JSON.stringify(reactionsObj, null, 2), (errAtReactions) => {
      if (errAtReactions) {
        console.log(chalk.bgRed.black('FAILED'), ' Writing /config/atReactions.json', `\n${err}`);
      } else {
        console.log(chalk.bgGreen.black('SUCCESS'), ' Writing /config/atReactions.json');
      }

      /** Write `txtReactions.json` */
      fs.writeFile('./config/txtReactions.json', JSON.stringify(reactionsObj, null, 2), (errTxtReactions) => {
        if (errTxtReactions) {
          console.log(chalk.bgRed.black('FAILED'), ' Writing /config/txtReactions.json', `\n${err}`);
        } else {
          console.log(chalk.bgGreen.black('SUCCESS'), ' Writing /config/txtReactions.json');
          console.log('\nSetup complete!\nRun "npm start" to start up your bot. :)');
          rl.close();
        }
      });
    });
  });
};

console.log('Generating configuration files for you. Just need some info first...'
  + '\n\nA (*) means that the setting is required. Otherwise, you can leave the setting blank.'
  + '\n[Refer to the README for more information on this setup script.]\n');

/** Define questions to ask */

const askForToken = () => new Promise((resolve, reject) => {
  try {
    /* eslint-disable */
      let notDone = true;
      
      rl.question('* Token: [Discord bot token] ', (token) => {
        token = token.trim();
        if (token.match(regToken)) {
          resolve(token);
          notDone = false;
        } else {
          // if token doesn't match expectations, ask again
          console.log('Woops, looks like that wasn\'t a valid token format... Please enter your Discord bot token again: ');
          askForToken().then(recursiveToken => {
            resolve(recursiveToken);
          });
        }
      });
      /* eslint-enable */
  } catch (err) {
    reject(err);
  }
});

const askForBotName = () => new Promise((resolve, reject) => {
  try {
    rl.question(`* Your bot's name: (${json.botNameProper}) `, (name) => {
      resolve(name.trim());
    });
  } catch (err) {
    reject(err);
  }
});

const ridWhiteSpace = name => name.replace(/\s/g, '');

const getCode = name => ridWhiteSpace(name).toLowerCase();

const askForPrefix = () => new Promise((resolve, reject) => {
  try {
    rl.question(`* Command prefix: (${json.prefix}) `, (prefix) => {
      resolve(ridWhiteSpace(prefix));
    });
  } catch (err) {
    reject(err);
  }
});

const askForMasterID = () => new Promise((resolve, reject) => {
  try {
    rl.question('* Your Discord User ID: ( ) [right click, Copy ID] ', (masterID) => {
      resolve(masterID.trim());
    });
  } catch (err) {
    reject(err);
  }
});

const askForMainGuild = () => new Promise((resolve, reject) => {
  try {
    rl.question('* Your Discord Server ID: ( ) [right click, Copy ID] ', (mainGuild) => {
      resolve(mainGuild.trim());
    });
  } catch (err) {
    reject(err);
  }
});

const askForTestGuild = () => new Promise((resolve, reject) => {
  try {
    rl.question('  Test Guild Server ID: ( ) [needed only for ExtendedEmoji] ', (testGuild) => {
      resolve(testGuild.trim());
    });
  } catch (err) {
    reject(err);
  }
});

const askForImgurToken = () => new Promise((resolve, reject) => {
  try {
    rl.question('  Imgur API Token: ( ) [needed only for `reloadfortunes`] ', (imgurToken) => {
      resolve(imgurToken.trim());
    });
  } catch (err) {
    reject(err);
  }
});

/** Start asking questions */
(async function exec() {
  try {
    json.token = await askForToken();

    const name = await askForBotName();
    if (name !== '') {
      json.botNameProper = name;
      json.botName = getCode(name);
    }

    const prefix = await askForPrefix();
    if (prefix !== '') {
      json.prefix = prefix;
    }

    const masterID = await askForMasterID();
    if (masterID !== '') {
      json.masterID = masterID;
    }

    const mainGuild = await askForMainGuild();
    if (mainGuild !== '') {
      json.mainGuild = mainGuild;
    }

    const testGuild = await askForTestGuild();
    if (testGuild !== '') {
      json.testGuild = testGuild;
    }

    const imgurToken = await askForImgurToken();
    if (imgurToken !== '') {
      json.fortune.token = imgurToken;
    }

    /* Write and close */
    writeFiles(json, { reactions: [] });
    rl.close();
  } catch (err) {
    console.error(err);
  }
}());
