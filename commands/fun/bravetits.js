const { SlashCommandBuilder } = require('discord.js');
const lib = require("../../functions/braveImageSearch.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bravetits')
		.setDescription('Show some tits'),
	async execute(interaction) {
		await interaction.deferReply();
		try {
			const modifier = ['round ', 'asian ', 'yoga ', 'slim ', 'athletic ', 'bikini ', 'lingerie ', 'tiny ', 'big '];
			const randomModifier = modifier[Math.floor(Math.random() * modifier.length)];
			const searchTerm = randomModifier + "photographed boobs";
			
			const imageUrl = await lib.searchBraveImages(searchTerm);
			if (!imageUrl) {
				throw new Error('Failed to fetch image');
			}
			
			await interaction.editReply(`TITS || ${imageUrl} ||`);
		} catch (error) {
			console.error('Error in bravetits command:', error);
			await interaction.editReply('Sorry, I couldn\'t find any tits this time 😔');
		}
	},
};