const { braveApiKey } = require('../config.json');
const axios = require('axios');

async function searchBraveImages(query) {
    const url = 'https://api.search.brave.com/res/v1/images/search';
    const params = {
        q: query,
        count: 50,
        offset: 0,
        safesearch: 'off',
        search_lang: 'en',
        spellcheck: 'off',
        text_decorations: false,
        source: 'web'
    };
    const headers = {
        'Accept': 'application/json',
        'X-Subscription-Token': braveApiKey
    };

    try {
        const response = await axios.get(url, { params, headers });
        console.log('API Response Structure:', Object.keys(response.data));
        console.log('First Result (if any):', response.data.results?.[0]);
        
        if (!response.data) {
            throw new Error('No response data received');
        }

        // Check if we got an error response from the API
        if (response.data.error) {
            throw new Error(`API Error: ${response.data.error}`);
        }

        if (!response.data.results || !Array.isArray(response.data.results)) {
            throw new Error(`Invalid results structure. Got: ${typeof response.data.results}`);
        }

        const images = response.data.results;
        if (images.length === 0) {
            throw new Error('No images found');
        }

        const randomImage = images[Math.floor(Math.random() * images.length)];
        console.log('Random Image Object:', randomImage);
        
        if (!randomImage.properties?.url) {
            throw new Error('No direct image URL found in result');
        }

        const imageUrl = randomImage.properties.url;
        console.log(`Searched for ${query} returned ${imageUrl}`);
        return imageUrl;
    } catch (error) {
        console.error('Error in searchBraveImages:', error.message);
        if (error.response) {
            console.error('API Response Status:', error.response.status);
            console.error('API Response Data:', error.response.data);
        }
        return null;
    }
}

module.exports.searchBraveImages = searchBraveImages;
