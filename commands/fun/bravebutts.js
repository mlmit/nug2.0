const { SlashCommandBuilder } = require('discord.js');
const lib = require("../../functions/braveImageSearch.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bravebutts')
		.setDescription('Show some butts'),
	async execute(interaction) {
		await interaction.deferReply();
		try {
			const modifier = ['round ', 'asian ', 'yoga ', 'slim ', 'athletic ', 'bikini ', 'lingerie ', 'jeans '];
			const randomModifier = modifier[Math.floor(Math.random() * modifier.length)];
			const searchTerm = randomModifier + "female ass";
			
			const imageUrl = await lib.searchBraveImages(searchTerm);
			if (!imageUrl) {
				throw new Error('Failed to fetch image');
			}
			
			await interaction.editReply(`BUTTS || ${imageUrl} ||`);
		} catch (error) {
			console.error('Error in bravebutts command:', error);
			await interaction.editReply('Sorry, I couldn\'t find any butts this time 😔');
		}
	},
};