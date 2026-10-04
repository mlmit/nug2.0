const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('raise')
        .setDescription('YOUR DONGERS'),
    async execute(interaction) {
        const body = await fetch('http://api.lenny.today/v1/random').then(response => response.json());
        return interaction.reply(body[0].face);
    }
};