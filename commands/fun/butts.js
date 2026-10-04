const { SlashCommandBuilder } = require('discord.js');
const lib = require("../../functions/redgifsSearch.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('butts')
		.setDescription('Show some butts'),
	async execute(interaction) {
		await interaction.deferReply();
		try {
			// The first term is the fallback when a modified search comes up empty
			const modifier = ['round ', 'asian ', 'yoga ', 'slim ', 'athletic ', 'bikini ', 'lingerie ', 'jeans '];
			const searchTerms = ['ass', ...modifier.map(m => m + 'ass')];

			const mediaUrl = await lib.searchRedgifs(searchTerms);
			if (!mediaUrl) {
				throw new Error('Failed to fetch media');
			}

			await interaction.editReply(`BUTTS || ${mediaUrl} ||`);
		} catch (error) {
			console.error('Error in butts command:', error);
			await interaction.editReply('Sorry, I couldn\'t find any butts this time 😔');
		}
	},
};
