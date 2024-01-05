const { bingServiceKey } = require('../config.json');
const axios = require('axios');

async function searchBingImages(query) {
	const url = 'https://api.bing.microsoft.com/v7.0/images/search';
	const params = {
		q: query,
		count: 50,
		safeSearch: 'Off',
	};
	const headers = {
		'Ocp-Apim-Subscription-Key': bingServiceKey
	};

	try {
		const response = await axios.get(url, { params, headers });
		const images = response.data.value;
		const randomImage = images[Math.floor(Math.random() * images.length)];
		console.log(`Searched for ${query} returned ${randomImage.contentUrl}`);
		return randomImage.contentUrl;
	} catch (error) {
		console.error(error);
		return null;
	}
}
module.exports.searchBingImages = searchBingImages;