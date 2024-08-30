const { Events, AttachmentBuilder } = require('discord.js');
const { b00ID, doomID, gidID, heelaID, ikeID, mithrusID, hihatID, witzID, nemesisID, omegaID, sainID,
    skierID, smash0rID, stubbsID, uriID, wangzangID, servoID, dromioID, maxyID, papeID, porkID, ellisID, p0ngID, nugID, nug2ID } = require('../discordusers.json');
const heicConvert = require('heic-convert');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or open the SQLite database
const db = new sqlite3.Database(path.resolve(__dirname, '../db/seen.sqlite'), (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create the table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS seen (
            user_id TEXT PRIMARY KEY,
            username TEXT,
            last_message TEXT,
            date TEXT,
            time TEXT
        )`);
    }
});

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
        // Log message details
        console.log(`Message from ${message.member.displayName}: ${message.content}`);

        // Record the user's last seen data in the SQLite database
        const userId = message.author.id;
        const username = message.author.tag;
        const content = message.content;
        const date = new Date();
        const dateString = date.toLocaleDateString();
        const timeString = date.toLocaleTimeString();

        // Insert or update the user's last seen data in the database
        db.run(`INSERT INTO seen (user_id, username, last_message, date, time) 
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(user_id) DO UPDATE SET 
                username = excluded.username,
                last_message = excluded.last_message,
                date = excluded.date,
                time = excluded.time`, [userId, username, content, dateString, timeString], (err) => {
            if (err) {
                console.error('Error updating seen data:', err.message);
            }
        });        
        
        // Check for specific commands and actions

        if (message.content === 'computers') {
            message.react('💩');
            message.react('539136926473519104');
            message.react('555924565310570497');
            return;
        }

        // Handle HEIC file attachments

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