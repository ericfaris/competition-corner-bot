require('dotenv').config()
const JSONdb = require('simple-json-db');
var Table = require('easy-table')
var numeral = require('numeral');
var outputHelper = require('../helpers/outputHelper');

module.exports = {
  slash: true,
  // testOnly: true,
  testOnly: false,
  guildOnly: true,
  hidden: false,
  description: 'Show leaderboard for the Competition Corner',
  callback: ({ args, interaction, channel }) => {
    let retVal;
    
    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      retVal = 'The show-leaderboard slash command can only be used in the <#' + process.env.COMPETITION_CHANNEL_ID + '> channel.';
    } else {
      
      const db = new JSONdb('db.json');

      // get scores from db
      const scores = db.get('scores') ? JSON.parse(db.get('scores')) : [];
      const teams = db.get('teams') ? JSON.parse(db.get('teams')) : [];

      // sort descending
      scores.sort((a, b) => (a.score < b.score) ? 1 : -1);

      retVal = outputHelper.printCombinedLeaderboard(scores, null, teams, true, true);
    }

    return retVal;
  },
}