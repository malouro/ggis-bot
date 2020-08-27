const fs = require('fs');
const path = require('path');

const guildConfigExists = async guildID => fs.exists(path.join(__dirname, `../config/guilds/${guildID}.json`));

const getCommandPrefix = async (message = null) => {
  /**
   * 1. Check if guild config exists
   */
  if (message) {
    const guildID = message.guild && message.guild.id;
    const configExists = await guildConfigExists(guildID);

    if (configExists) {
      // ???
    }
  }
};

module.exports = {
  getCommandPrefix,
};
