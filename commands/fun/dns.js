const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dns')
        .setDescription('post the dns picture'),
    async execute(interaction) {
        await interaction.reply('https://i.imgur.com/yHj6RdR.jpg');
    },
}