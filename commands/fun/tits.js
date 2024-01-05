const { SlashCommandBuilder } = require('discord.js');
const lib = require("../../functions/bingImageSearch.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tits')
		.setDescription('Show some tits'),
	async execute(interaction) {
        const modifier = ['tiny ', 'yoga ', 'athletic ', 'bikini ', 'lingerie ', 'round ', 'big ', ' ']
        let randomModifier = Math.floor(Math.random() * modifier.length);
        let searchTerm = "tits";
		searchTerm = modifier[randomModifier] + "tits";
		const imageUrl = await lib.searchBingImages(searchTerm);
		await interaction.reply(`TITS || ${imageUrl} ||`);
	},
};