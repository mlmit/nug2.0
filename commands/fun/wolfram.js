const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { wolframAPI } = require('../../config.json');

/**
 * Validates and sanitizes the input question
 * @param {string} question - The question to validate
 * @returns {string} - Sanitized question
 * @throws {Error} - If question is invalid
 */
const validateQuestion = (question) => {
    if (!question || question.trim().length === 0) {
        throw new Error('Question cannot be empty');
    }
    // Remove multiple spaces and trim
    return question.replace(/\s+/g, ' ').trim();
};

/**
 * Formats the Wolfram Alpha response for Discord
 * @param {string} question - The original question
 * @param {string} answer - The answer from Wolfram Alpha
 * @returns {string} - Formatted response
 */
const formatResponse = (question, answer) => {
    return `**Question:** ${question}\n**Answer:** ${answer}`;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wolfram')
        .setDescription('Ask Wolfram Alpha a question and get a computed answer')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('What would you like to ask Wolfram Alpha?')
                .setRequired(true)),

    async execute(interaction) {
        try {
            // Defer reply since API call might take time
            await interaction.deferReply();

            const question = validateQuestion(interaction.options.getString('question'));
            const encodedQuestion = encodeURIComponent(question);
            
            const response = await fetch(`${wolframAPI}${encodedQuestion}`);
            
            if (!response.ok) {
                throw new Error(`Wolfram Alpha API error: ${response.statusText}`);
            }

            const answer = await response.text();
            
            if (!answer || answer.toLowerCase().includes('error')) {
                await interaction.editReply('Sorry, I couldn\'t find an answer to your question on Wolfram Alpha.');
                return;
            }

            await interaction.editReply(formatResponse(question, answer));
        } catch (error) {
            const errorMessage = error.message || 'An unexpected error occurred';
            await interaction.editReply(`❌ ${errorMessage}`);
            console.error('Wolfram command error:', error);
        }
    },
};