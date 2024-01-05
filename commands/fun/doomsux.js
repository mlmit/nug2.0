const { SlashCommandBuilder } = require('discord.js');
const { isUrl } = require('../../functions/isUrl.js');
const { isValidUrl } = require('../../functions/isValidUrl.js')
const db = require('../../db/dbConnector.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('doomsux')
        .setDescription('Adds or retrieves a new doomsux')
        .addStringOption(option =>
            option.setName('argument')
                .setDescription('url to the doomsux, info or blank for a random sux')
                .setRequired(false)),
    async execute(interaction) {
        const url = interaction.options.getString('argument');
        if (!url) {
            db.suxdb.serialize(() => {
                db.suxdb.all(`SELECT sux sux FROM doomsuxes ORDER BY Random() LIMIT 1`, (err, row) => {
                    if (err) {
                        console.log(err.message);
                        return interaction.reply(`whoops`);
                    }
                    return interaction.reply(row[0].sux);
                });
            });
        } else if (!isValidUrl(url)) {
            if (url === 'info') {
                db.suxdb.serialize(() => {
                    db.suxdb.all(`SELECT COUNT(sux) AS countsux, COUNT(DISTINCT username) AS usercount FROM doomsuxes`, (err, rows) => {
                        if (err) {
                            return interaction.reply(`NOPE`);
                        }
                        let suxResults = rows[0].countsux;
                        let userResults = rows[0].usercount;
                        return interaction.reply(`There are ${suxResults} doomsuxii in the database from ${userResults} different users.`);
                    })
                })
            } else 
                return interaction.reply(`Please provide the doomsux in the form of an URL ${url} is not a valid URL`)
        } else {
            db.suxdb.run(`INSERT INTO doomsuxes (sux, username, createdAt, updatedAt) VALUES (?, ?, datetime(\'now\'), datetime(\'now\'))`, [url, interaction.member.id, ], function(err) {
                if (err) {
                    return interaction.reply(`That sux probably already exists`);
                }
                return interaction.reply(`Added new doomsux`);
            });
        }
    }
}