const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getRandomFactoid, formatFactoid } = require('../../functions/factoids.js');

const DISCORD_MAX_LENGTH = 2000;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Shows a random factoid'),
    async execute(interaction) {
        try {
            const factoid = await getRandomFactoid();
            if (!factoid) {
                return interaction.reply({ content: "I don't know any factoids yet.", flags: MessageFlags.Ephemeral });
            }

            const who = interaction.member?.displayName ?? interaction.user.username;
            // Fall back to the raw value for <react> factoids and values that are empty after markup
            const text = formatFactoid(factoid.key, factoid.value, who)?.content ?? `${factoid.key} is ${factoid.value.trim()}`;

            // Show the key (a <reply> factoid hides it) plus whoever taught it and when, if known
            let footer = `\n-# "${factoid.key}"`;
            if (factoid.createdBy || factoid.createdTime) {
                footer += ' learned';
                if (factoid.createdBy) {
                    footer += ` from <@${factoid.createdBy}>`;
                }
                if (factoid.createdTime) {
                    footer += ` on <t:${factoid.createdTime}:D>`;
                }
            }

            const maxText = DISCORD_MAX_LENGTH - footer.length;
            const body = text.length > maxText ? `${text.slice(0, maxText - 1)}…` : text;
            // Mentions render as names but never ping
            await interaction.reply({ content: body + footer, allowedMentions: { parse: [] } });
        } catch (error) {
            console.error('Error getting random factoid:', error);
            await interaction.reply({ content: 'Something went wrong fetching a random factoid.', flags: MessageFlags.Ephemeral });
        }
    },
};
