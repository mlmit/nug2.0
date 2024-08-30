const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or open the SQLite database
const db = new sqlite3.Database(path.resolve(__dirname, '../../db/seen.sqlite'), (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seen')
        .setDescription('Displays the last seen information of a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check')
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');

        // Query the database for the specified user
        db.get(`SELECT * FROM seen WHERE user_id = ?`, [user.id], (err, row) => {
            if (err) {
                console.error('Error retrieving seen data:', err.message);
                interaction.reply({ content: 'An error occurred while retrieving data.', ephemeral: true });
                return;
            }

            if (row) {
                interaction.reply(`${user.tag} was last seen on ${row.date} at ${row.time} saying: "${row.last_message}"`);
            } else {
                interaction.reply(`${user.tag} has not been seen yet.`);
            }
        });
    },
};
