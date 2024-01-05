const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('oregon')
        .setDescription('Will you survive?'),
    async execute(interaction) {
        const trailResponses = [" eaten by land shark. died.", " died of dysentery.", " died of measles.", " died of typhoid.", " died of cholera.", " died of a broken limb.", " died of a snake bite.", " died of exhaustion.", " drowned.", " died of gout.", " looked at bird; died."];
        var trailres = trailResponses [Math.floor(Math.random() * trailResponses.length)];
        if ((Math.floor(Math.random() * 25)) < 1) {
            return interaction.reply(`Made it to Oregon - then died`);
        } else {
            return interaction.reply(trailres).then().catch(console.error);
        }
    }
}