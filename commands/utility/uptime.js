const { SlashCommandBuilder } = require('discord.js');
const { convertMS } = require('../../functions/convertMS');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('uptime')
		.setDescription('Gives bot uptime stats'),
	async execute(interaction) {
        let uptimeDate = '';
        uptimeDate = await convertMS(interaction.client.uptime);
		await interaction.reply(`It has been ${uptimeDate} since Smash restarted me to test some shitty code`);
	},
};
