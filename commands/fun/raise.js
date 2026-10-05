const { SlashCommandBuilder, escapeMarkdown } = require('discord.js');
const { randomLenny } = require('../../functions/lenny.js');

const parts = ['ears', 'eyes', 'mouth'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('raise')
        .setDescription('YOUR DONGERS')
        .addStringOption(option => option.setName('ears').setDescription('Characters to use for both ears').setMaxLength(16))
        .addStringOption(option => option.setName('eyes').setDescription('Characters to use for both eyes').setMaxLength(16))
        .addStringOption(option => option.setName('mouth').setDescription('Characters to use for the mouth').setMaxLength(16)),
    async execute(interaction) {
        const options = {};
        for (const part of parts) {
            const value = interaction.options.getString(part);
            if (value) options[part] = value;
        }
        return interaction.reply(escapeMarkdown(randomLenny(options)));
    }
};
