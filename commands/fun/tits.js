const { SlashCommandBuilder } = require('discord.js');
const lib = require("../../functions/redgifsSearch.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tits')
		.setDescription('Show some tits'),
	async execute(interaction) {
		await interaction.deferReply();
		try {
			const mediaUrl = await lib.searchRedgifs({
				niche: 'just-boobs',
				requiredTags: ['Boobs', 'Tits', 'Big Tits', 'Small Tits', 'Natural Tits', 'Huge Tits', 'Fake Tits', 'Fake Boobs', 'Busty', 'Nipples', 'Titty Drop', 'Bouncing Tits', 'Sideboob', 'Underboob', 'Cleavage'],
				// Results that are mostly about something lower down
				excludedTags: ['Asshole', 'Pussy', 'Shaved Pussy', 'Spread Pussy', 'Wet Pussy'],
			});
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
