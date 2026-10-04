const { Events, MessageFlags } = require('discord.js');
const { ALLOWED_CHANNEL_IDS, isAllowedChannel } = require('../functions/allowedChannels.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		if (!isAllowedChannel(interaction.channelId, interaction.channel)) {
			const channels = ALLOWED_CHANNEL_IDS.map(id => `<#${id}>`).join(' and ');
			await interaction.reply({ content: `I only work in ${channels}.`, flags: MessageFlags.Ephemeral });
			return;
		}

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			}
		}
	},
};
