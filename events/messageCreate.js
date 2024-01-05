const { Events } = require('discord.js');
const { b00ID, doomID, gidID, heelaID, ikeID, mithrusID, hihatID, witzID, nemesisID, omegaID, sainID,
    skierID, smash0rID, stubbsID, uriID, wangzangID, servoID, dromioID, maxyID, papeID, porkID, ellisID, p0ngID, nugID, nug2ID } = require('../discordusers.json');

module.exports = {
    name: Events.MessageCreate,
    once: false,
    execute(message) {
        console.log(`Message from ${message.author.tag}: ${message.content}`);
    },
};