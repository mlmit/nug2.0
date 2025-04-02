const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('topic')
        .setDescription('Sets the channel topic')
        .addStringOption(option => 
            option.setName('text')
                .setDescription('The new topic text')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    async execute(interaction) {
        // Defer reply to give time for the operation to complete
        await interaction.deferReply();
        
        try {
            const newTopic = interaction.options.getString('text');
            const channel = interaction.channel;
            
            // Check if the bot has permissions to edit the channel
            if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.ManageChannels)) {
                return interaction.editReply({ 
                    content: '❌ I don\'t have permission to manage channels!'
                });
            }
            
            // Set the new topic
            await channel.setTopic(newTopic);
            
            // Send success message - now visible to everyone in the channel
            await interaction.editReply({ 
                content: `✅ Channel topic has been updated to: "${newTopic}"`
            });
            
        } catch (error) {
            console.error(error);
            await interaction.editReply({ 
                content: '❌ There was an error while updating the channel topic!'
            });
        }
    },
};