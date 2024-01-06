const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { wolframAPI } = require('../../config.json');

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wolfram')
        .setDescription('Ask Wolfram Alpha something, and maybe get a response')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('what you want to ask Wolfram Alpha')
                .setRequired(true)),
    async execute(interaction) {
        var question = interaction.options.getString('question');
        var commandArgs = encodeURIComponent(question);
        var body = await fetch(wolframAPI + commandArgs).then(handleErrors).then(response => response.text()).catch(error => interaction.reply('I was unable to find a result on Wolfram Alpha.'));
        return interaction.reply(`You asked: ${question} : ${body}`);
    }

}