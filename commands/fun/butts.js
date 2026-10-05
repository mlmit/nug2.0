const { SlashCommandBuilder } = require('discord.js');
const lib = require("../../functions/redgifsSearch.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('butts')
		.setDescription('Show some butts'),
	async execute(interaction) {
		await interaction.deferReply();
		try {
			const mediaUrl = await lib.searchRedgifs({
				niche: 'thick-booty',
				requiredTags: ['Ass', 'Big Ass', 'Booty', 'Bubble Butt', 'Butt', 'Phat Ass', 'Pawg', 'Ass Shaking', 'Ass Clapping', 'Twerking', 'Thong', 'Jiggling'],
			});
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
