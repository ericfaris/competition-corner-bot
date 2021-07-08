require('dotenv').config()
const JSONdb = require('simple-json-db');
const outputHelper = require('../helpers/outputHelper');
const permissionHelper = require('../helpers/permissionHelper');

module.exports = {
  slash: true,
  // testOnly: true,
  testOnly: false,
  guildOnly: true,
  hidden: true,
  description: 'Reset/clear scores and teams for Competition Corner, Archives current week data (ADMINISTRATOR)',
  permissions: ['ADMINISTRATOR'],
  callback: async ({client, channel, interaction}) => {
    let retVal;

    if(!(await permissionHelper.hasPermission(client, interaction, module.exports.permissions))) {
      console.log(interaction.member.user.username + ' DOES NOT have ADMINISTRATOR permissions to run reset-scores.')
      return 'The reset-scores slash command can only be executed by an admin.';
    }
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      retVal = 'The reset-scores slash command can only be used in the <#' + process.env.COMPETITION_CHANNEL_ID + '> channel.';
    } else {
      const db = new JSONdb('db.json');
      const archive = new JSONdb('archive.json');
      
      archive.storage.push(db.storage);
      archive.sync();

      // get scores from db
      const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];

      // get details from db
      const details = db.get('details') ? JSON.parse(db.get('details')) : null;

      // get teams from db
      const teams = db.get('teams') ? JSON.parse(db.get('teams')) : [];

      // clear scores
      db.delete('scores');
      // clear teams
      db.delete('teams');

      //post to competition channel pinned message
      await outputHelper.editCompetitionCornerMessage([], client, details, teams);

      retVal = "Scores and Teams have been reset."
    }

    return retVal;
  },
}