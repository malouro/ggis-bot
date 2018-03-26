/**
 * Setup Script
 *  - Creates setting.json file (given user input)
 *  - Creates blank atReaction, and txtReaction.json files
 */

const readline = require('readline');
const chalk = require('chalk');
const fs = require('fs');

const json = JSON.parse(fs.readFileSync('settings.template.json', 'utf8'));
const reactions = {
  reactions: [],
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const getCode = name => name.replace(/\s/, '').toLowerCase();

const writeFiles = (settingsObj, reactionsObj) => {
  console.log('\n');

  /** Write `settings.json` */
  fs.writeFile('settings.json', JSON.stringify(settingsObj), (err) => {
    if (err) {
      console.log(chalk.bgRed.black('FAILED'), ' Writing settings.json');
    } else {
      /** create backup file */
      fs.writeFile('settings.backup.json', JSON.stringify(settingsObj), (errOnBackup) => {
        if (errOnBackup) {
          console.log(errOnBackup);
        }
      });

      console.log(chalk.bgGreen.black('SUCCESS'), ' Writing settings.json');
    }

    /** Write `atReactions.json` */
    fs.writeFile('./config/atReactions.json', JSON.stringify(reactionsObj), (errAtReactions) => {
      if (errAtReactions) {
        console.log(chalk.bgRed.black('FAILED'), ' Writing /config/atReactions.json');
      } else {
        console.log(chalk.bgGreen.black('SUCCESS'), ' Writing /config/atReactions.json');
      }

      /** Write `txtReactions.json` */
      fs.writeFile('./config/txtReactions.json', JSON.stringify(reactionsObj), (errTxtReactions) => {
        if (errTxtReactions) {
          console.log(chalk.bgRed.black('FAILED'), ' Writing /config/txtReactions.json');
        } else {
          console.log(chalk.bgGreen.black('SUCCESS'), ' Writing /config/txtReactions.json');
          console.log('\nSetup complete!\nRun "npm start" to start up your bot. :)');
          rl.close();
        }
      });
    });
  });
};

console.log('Generating configuration files for you. Just need some info first...' +
  '\n\nA (*) means that the setting is required. Otherwise, you can leave the setting blank.' +
  '\n[Refer to the README for more information on this setup script.]\n');

/** ******************************************************************************* */
/** Incoming death pyramid, watch your step...                                      */
/** @todo There's definitely a better way to do this, but for now this will suffice */
/** @todo Run regex for Discord token to prevent errors ?                           */
/** ******************************************************************************* */

rl.question('* Token: [Discord app token, keep this private!] ', (token) => {
  json.token = token;
  rl.question(`* Bot user name [spaces will be trimmed]: (${json.botNameProper}) `, (name) => {
    if (name !== '') json.botNameProper = name;
    json.botName = getCode(json.botNameProper);
    rl.question(`* Command prefix: (${json.prefix}) `, (prefix) => {
      if (prefix !== '') json.prefix = prefix;
      rl.question('* Your Discord User ID: ( ) [right click, Copy ID] ', (masterID) => {
        json.masterID = masterID;
        rl.question('* Your Discord Server ID: ( ) [right click, Copy ID] ', (mainGuild) => {
          json.mainGuild = mainGuild;
          rl.question('  Test Guild Server ID: ( ) [needed only for ExtendedEmoji] ', (testGuild) => {
            json.testGuild = testGuild;
            rl.question('  Imgur API Token: ( ) [needed only for `reloadfortunes`] ', (imgurToken) => {
              json.fortune.token = imgurToken;
              writeFiles(json, reactions);
            });
          });
        });
      });
    });
  });
});

