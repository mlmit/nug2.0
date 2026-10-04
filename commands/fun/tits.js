const { SlashCommandBuilder } = require('discord.js');
const lib = require("../../functions/redgifsSearch.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tits')
		.setDescription('Show some tits'),
	async execute(interaction) {
		await interaction.deferReply();
		try {
			// The first term is the fallback when a modified search comes up empty
			const modifier = ['round ', 'asian ', 'yoga ', 'slim ', 'athletic ', 'bikini ', 'lingerie ', 'tiny ', 'big '];
			const searchTerms = ['boobs', ...modifier.map(m => m + 'boobs')];

			const mediaUrl = await lib.searchRedgifs(searchTerms);
			if (!mediaUrl) {
				throw new Error('Failed to fetch media');
			}

			await interaction.editReply(`TITS || ${mediaUrl} ||`);
		} catch (error) {
			console.error('Error in tits command:', error);
			await interaction.editReply('Sorry, I couldn\'t find any tits this time 😔');
		}
	},
};
