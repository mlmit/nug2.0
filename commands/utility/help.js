const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all available commands.'),
    async execute(interaction) {
        const commands = interaction.client.commands; // Assuming commands are stored in client.commands

        if (!commands || commands.size === 0) {
            return interaction.reply({ content: 'No commands are available.', ephemeral: true });
        }

        // Create a help message dynamically from the commands collection
        const helpEmbed = new EmbedBuilder()
            .setTitle('Available Commands')
            .setDescription('Here is a list of all available commands:')
            .setColor(0x00FF00); // Set to your preferred embed color

        commands.forEach(command => {
            helpEmbed.addFields({ name: `/${command.data.name}`, value: command.data.description || 'No description provided.' });
        });

        // Reply with the help embed, set to be ephemeral
        await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    },
};
