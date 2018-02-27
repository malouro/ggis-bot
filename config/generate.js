/**
 * Setup Script
 *  - Creates setting.json file (given user input)
 *  - Creates blank atreaction, and txtreaction.json files
 */

const readline = require('readline');
const fs = require('fs');

const json = JSON.parse(fs.readFileSync('settings.template.json', 'utf8'));
const reactions = { reactions: [] };

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const getCode = (name) => name.replace(/\s/, '').toLowerCase();

console.log('Generating a settings.json file for you! Just need some info first...\n\nA (*) means that the setting is required. Otherwise, you can leave the setting blank.\n[Refer to the README for more information on this setup script.]\n');

/* Incoming death pyramid, watch your step... */
/** @todo There's definitely a better way to do this lol */

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
            rl.question('  Imgur API Token: ( ) [needed only for !reloadfortunes] ', (imgurToken) => {
              json.fortune.token = imgurToken;
              console.log('\nWriting settings.json...');
              fs.writeFile('settings.json', JSON.stringify(json), (err) => {
                if (err) throw err;
                fs.writeFile('settings.backup.json', JSON.stringify(json), (errOnBackup) => { console.log(errOnBackup); });
                console.log('Done.\n');
                console.log('Writing a blank atreactions.json config...\n(You can edit this file at any time. Look at atreactions.template.json for an example of what you can do with this)');
                fs.writeFile('./config/atreactions.json', JSON.stringify(reactions), (err1) => {
                  if (err1) throw err1;
                  console.log('Done.\n');
                  console.log('Writing a blank txtreactions.json config...\n(You can edit this file at any time. Look at txtreactions.template.json for an example of what you can do with this)');
                  fs.writeFile('./config/txtreactions.json', JSON.stringify(reactions), (err2) => {
                    if (err2) throw err2;
                    console.log('Done.\n');
                    console.log('Setup complete!\nRun "npm start" to start up your bot. :)');
                    rl.close();
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
