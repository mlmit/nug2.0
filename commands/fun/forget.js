const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { forgetFactoid } = require('../../functions/factoids.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forget')
        .setDescription('Makes the bot forget the factoid for a key')
        .addStringOption(option =>
            option.setName('key')
                .setDescription('The factoid key to forget')
                .setRequired(true)),
    async execute(interaction) {
        const key = interaction.options.getString('key');
        try {
            const forgotten = await forgetFactoid(key);
            if (!forgotten) {
                return interaction.reply({ content: `I don't know anything about "${key}".`, flags: MessageFlags.Ephemeral, allowedMentions: { parse: [] } });
            }

            // Log the full factoid so it can be restored by hand if needed
            console.log(`Factoid forgotten by ${interaction.user.tag}: ${JSON.stringify(forgotten)}`);
            const value = forgotten.value.length > 1500 ? `${forgotten.value.slice(0, 1500)}…` : forgotten.value;
            await interaction.reply({ content: `I forgot "${forgotten.key}" (it was: ${value})`, allowedMentions: { parse: [] } });
        } catch (error) {
            console.error('Error forgetting factoid:', error);
            await interaction.reply({ content: 'Something went wrong forgetting that factoid.', flags: MessageFlags.Ephemeral });
        }
    },
};
