const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bullshit')
        .setDescription('Some random ass bullshit'),
    async execute(interaction) {
        const body = await fetch('https://corporatebs-generator.sameerkumar.website/').then(response => response.json());
        return interaction.reply(body.phrase);
    }
};