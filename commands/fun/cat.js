const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cat')
        .setDescription('Random Feline'),
    async execute(interaction) {
        const body = await fetch('https://api.thecatapi.com/v1/images/search?api_key=ba4b317f-589b-4e8b-bc5b-c21136c4e9ef').then(response => response.json());
        return interaction.reply(`KITTEH! ${body[0].url}`);
    }
};