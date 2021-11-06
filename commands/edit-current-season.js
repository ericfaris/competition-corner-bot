require('dotenv').config()
const path = require('path');
const dbHelper = require('../helpers/dbHelper');
const mongoHelper = require('../helpers/mongoHelper');
const outputHelper = require('../helpers/outputHelper');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  commandName: path.basename(__filename).split('.')[0],
  slash: true,
  testOnly: process.env.TEST_ONLY,
  guildOnly: true,
  description: 'RecaEdit current season details and recalculate and re-post the season leaderboard pinned message (MANAGE_GUILD)',
  permissions: ['MANAGE_GUILD'],
  roles: ['Competition Corner Mod'],
  minArgs: 4,
  expectedArgs: '<seasonnumber> <seasonname> <seasonstart> <seasonend>',
  callback: async ({args, client, channel, interaction, instance}) => {
    let retVal;

    if(!(await permissionHelper.hasPermissionOrRole(client, interaction, module.exports.permissions, module.exports.roles))) {
      console.log(`${interaction.member.user.username} DOES NOT have the correct role or permission to run ${module.exports.commandName}.`)
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      return `The ${module.exports.commandName} slash command can only be executed by an admin. This message will be deleted in ${instance.del} seconds.`;
    }
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = `The ${module.exports.commandName} slash command can only be used in the <#${process.env.COMPETITION_CHANNEL_ID}> channel.` 
        + ` This message will be deleted in ${instance.del} seconds.`;
    } else {
      const [seasonnumber, seasonname, seasonstart, seasonend] = args;

      const season = await mongoHelper.findOneAndUpdate({ isArchived: false}, {
        $set : {
          'seasonNumber': seasonnumber,
          'seasonName': seasonname,
          'seasonStart': seasonstart,
          'seasonEnd': seasonend,
        }}, 
        { returnNewDocument: true },
        'vpc', 'seasons');

      const weeks = await mongoHelper.find(
        { periodStart: {
            "$gte": season.value.seasonStart,
          },
          periodEndDate: {
            "$lte": season.value.seasonEnd,
          }
        }, 'vpc', 'weeks'
      )

      await outputHelper.editSeasonCompetitionCornerMessage(season.value, weeks, client);

      retVal = "Season has been updated."
    }

    return retVal;
  },
}