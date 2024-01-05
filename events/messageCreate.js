const { Events, AttachmentBuilder } = require('discord.js');
const { b00ID, doomID, gidID, heelaID, ikeID, mithrusID, hihatID, witzID, nemesisID, omegaID, sainID,
    skierID, smash0rID, stubbsID, uriID, wangzangID, servoID, dromioID, maxyID, papeID, porkID, ellisID, p0ngID, nugID, nug2ID } = require('../discordusers.json');
const heicConvert = require('heic-convert');
const axios = require('axios');


module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) {
            return;
        };
        if (message.author.id === '1192487272457719858') {
            return;
        }
        console.log(`Message from ${message.member.displayName}: ${message.content}`);
        if (message.content === 'computers') {
            message.react('💩');
            message.react('539136926473519104');
            message.react('555924565310570497');
            return;
        }
        if (message.attachments.size > 0) {
            const attachmentsArray = Array.from(message.attachments.values());

            for (const attachment of attachmentsArray) {
                if (attachment.name.endsWith('HEIC') || attachment.name.endsWith('heic')) {
                    try {
                        // Download the HEIC
                        const response = await axios.get(attachment.url, {
                            responseType: 'arraybuffer',
                        });

                        const buffer = Buffer.from(response.data);

                        // Convert the HEIC to JPEG
                        const outputBuffer = await heicConvert({
                            buffer: buffer,
                            format: 'JPEG',
                            quality: 1,
                        });

                        // Send the JPEG back to the channel
                        const filename = `${attachment.name.split('.')[0]}.jpg`;
                        const attachmentFile = new AttachmentBuilder(outputBuffer, { name: filename });
                        await message.channel.send({ content: 'Converted HEIC to JPEG:', files: [attachmentFile] });
                    } catch (error) {
                        console.error(`Error occurred: ${error}`);
                        await message.channel.send('An error occurred while converting the image.');
                    }
                }
            }    
            return;
        }    
    },
};