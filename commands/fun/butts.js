const { SlashCommandBuilder } = require('discord.js');
const lib = require("../../functions/bingImageSearch.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('butts')
		.setDescription('Show some butts'),
	async execute(interaction) {
        const modifier = ['round ', 'asian ', 'yoga ', 'slim ', 'athletic ', 'bikini ', 'lingerie ', 'jeans ']
        let randomModifier = Math.floor(Math.random() * modifier.length);
        let searchTerm = "female ass";
		searchTerm = modifier[randomModifier] + "female ass";
		const imageUrl = await lib.searchBingImages(searchTerm);
		await interaction.reply(`BUTTS || ${imageUrl} ||`);
	},
};