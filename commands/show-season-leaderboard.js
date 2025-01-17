require('dotenv').config()
const path = require('path');
const responseHelper = require('../helpers/responseHelper');
const mongoHelper = require('../helpers/mongoHelper');
const { PermissionHelper } = require('../helpers/permissionHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: true,
  guildOnly: true,
  description: 'Show season leaderboard for the Competition Corner',
  channels: [process.env.COMPETITION_CHANNEL_NAME],
  callback: async ({ channel, interaction }) => {
    let retVal;
    const permissionHelper = new PermissionHelper();

    // Check if the Channel is valid
    retVal = await permissionHelper.isValidChannel(module.exports.channels, interaction, module.exports.commandName);
    if (retVal) {interaction.reply({content: retVal, ephemeral: true}); return;}

    try{
      const currentSeason = await mongoHelper.findOne({ channelName: channel.name, isArchived: false }, 'seasons');

      if(currentSeason) {
        module.exports.getSeasonLeaderboard(channel, interaction);
      } else {
        interaction.reply({content: 'No season found.', ephemeral: false});
      }
    } catch(e) {
      logger.error(e);
      interaction.reply({content: e.message, ephemeral: true});
    }
  },

  getSeasonLeaderboard : async (channel, interaction) => {
    const currentSeason = await mongoHelper.findOne({ channelName: channel.name, isArchived: false }, 'seasons');
    const weeks = await mongoHelper.find({
      channelName: channel.name,
      isArchived: true,
      periodStart: { $gte: currentSeason.seasonStart },
      periodEnd: { $lte: currentSeason.seasonEnd }
    }, 'weeks');

    return responseHelper.showSeasonLeaderboard(weeks, interaction, true)
  }

}