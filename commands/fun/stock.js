const { alphaVantageKey } = require('../../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { createCanvas, registerFont } = require('canvas');
const { Chart, registerables } = require('chart.js');
const axios = require('axios');

// Register a custom font manually
// registerFont('./fonts/OpenSans-Regular.ttf', { family: 'Open Sans' });

// Register required components
Chart.register(...registerables);

const ALPHA_VANTAGE_API_KEY = alphaVantageKey; // Replace with your Alpha Vantage API key

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stock')
        .setDescription('Fetches stock history for a specified number of days (1-30)')
        .addStringOption(option =>
            option.setName('ticker')
                .setDescription('Stock ticker symbol')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('days')
                .setDescription('Number of days (1-30)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(30)),
    async execute(interaction) {
        const ticker = interaction.options.getString('ticker').toUpperCase();
        const days = interaction.options.getInteger('days');

        try {
            // Fetch daily stock data from Alpha Vantage
            const response = await axios.get(`https://www.alphavantage.co/query`, {
                params: {
                    function: 'TIME_SERIES_DAILY',
                    symbol: ticker,
                    apikey: ALPHA_VANTAGE_API_KEY,
                    outputsize: 'compact' // Compact mode retrieves the last 100 data points
                }
            });

            const data = response.data['Time Series (Daily)'];
            if (!data) {
                throw new Error('Invalid ticker symbol or market not supported.');
            }

            // Extract the specified number of trading days of data
            const dates = Object.keys(data).slice(0, days).reverse(); // Get the most recent 'days' number of entries
            const prices = dates.map(date => parseFloat(data[date]['4. close'])); // Get closing prices

            // Create a chart image
            const canvas = createCanvas(800, 400);
            const ctx = canvas.getContext('2d');

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                    datasets: [{
                        label: `${ticker} ${days}-Day History`,
                        data: prices,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        fill: false,
                        font: { family: 'Open Sans' } // Specify the registered font
                    }],
                },
                options: {
                    scales: {
                        x: {
                            type: 'category', // Use 'category' type with formatted date strings
                        },
                        y: {
                            beginAtZero: false
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                font: {
                                    family: 'Open Sans' // Ensure the font is used in labels
                                }
                            }
                        }
                    }
                }
            });

            // Convert chart to buffer and send as attachment
            const buffer = canvas.toBuffer('image/png');
            await interaction.reply({
                files: [{ attachment: buffer, name: `${ticker}_${days}day_history.png` }]
            });

        } catch (error) {
            console.error('Error fetching or processing stock data:', error);
            await interaction.reply({ content: `Error fetching stock data: ${error.message}`, ephemeral: true });
        }
    },
};
