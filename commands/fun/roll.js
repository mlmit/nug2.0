const { SlashCommandBuilder } = require('discord.js');
const { DiceRoller } = require('@dice-roller/rpg-dice-roller');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Rolls dice utilizing standard dice notation eg. 4d6')
        .addStringOption(option =>
            option.setName('notation')
                .setDescription('Dice notation (e.g. 4d6, 2d12)')
                .setRequired(true)),
    async execute(interaction) {
        const notation = interaction.options.getString('notation');
        try {
            const roller = new DiceRoller();
            roller.roll(notation);
            const result = roller.log.shift();
            await interaction.reply(`🎲 Rolled: ${result}`);
        } catch (error) {
            await interaction.reply({ content: `There was an error with your roll: ${error.message}`, ephemeral: true});
        }
    },
};