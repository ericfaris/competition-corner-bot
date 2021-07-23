const DiscordJS = require('discord.js')
const https =  require('https');
require('dotenv').config()
const fetch = require('node-fetch');
const permissionHelper = require('../helpers/permissionHelper');
const responseHelper = require('../helpers/responseHelper');

module.exports = {
  slash: true,
  testOnly: process.env.TEST_ONLY,
  hidden: true,
  minArgs: 1,
  expectedArgs: '<period>',
  permissions: ['ADMINISTRATOR'],
  description: 'Create team signup message for Competition Corner (ADMINISTRATOR)',
  callback: async ({args, client, channel, interaction, instance}) => {
    let retVal;
    const [period] = args;

    if(!(await permissionHelper.hasPermission(client, interaction, module.exports.permissions))) {
      console.log(interaction.member.user.username + ' DOES NOT have ADMINISTRATOR permissions to run create-team-signup-message.')
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      return 'The create-team signup message slash command can only be executed by an admin.  '
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    }

    if(channel.name !== process.env.COMPETITION_CHANNEL_NAME) {
      responseHelper.deleteOriginalMessage(interaction, instance.del);
      retVal = 'The create-team-signup-message slash command can only be used in the <#' + process.env.COMPETITION_CHANNEL_ID + '> channel.' 
        + ' This message will be deleted in ' + instance.del + ' seconds.';
    } else {
      const compChannel = await client.channels.fetch(process.env.COMPETITION_CHANNEL_ID);
      const strText = '**Team Competition Signup for Next Week (' + period + '**)\n\n' +
        'If you are playing next week, **' + period + '**, please add and/or click on the "thumbs up" emoji below ' + 
        '(**add the thumbs up emoji if you are the first person to signup**). ' + 
        'We will keep the signups open until 11:59pm PST on Sunday night.  We will then assign somewhat random but fair teams.';
      compChannel.send(strText);

      responseHelper.deleteOriginalMessage(interaction, 0);
      retVal = 'Message created successfully.'
    } 
    
    return retVal;
  },
}
