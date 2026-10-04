const axios = require('axios');

const API = 'https://api.redgifs.com/v2';
// Temporary tokens are bound to the IP and User-Agent that requested them, so every call must send the same one
const USER_AGENT = 'nug2.0-discord-bot';
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;

const ORDERS = ['trending', 'top7', 'top28', 'latest', 'top'];
const MEDIA_TYPES = ['g', 'i']; // g = video/gif, i = still image
const MAX_PAGE = 5;
// RedGifs "sexuality" categories to skip: animated content, and male-focused results for these searches
const EXCLUDED_SEXUALITY = ['animated', 'gay'];

// Short memory of recently posted items so the same ones don't come up again soon
const RECENT_LIMIT = 200;
const recentIds = [];

let token = null;
let tokenExpiresAt = 0;

async function getToken(forceRefresh = false) {
    if (!forceRefresh && token && Date.now() < tokenExpiresAt - TOKEN_REFRESH_MARGIN_MS) {
        return token;
    }
    const { data } = await axios.get(`${API}/auth/temporary`, { headers: { 'User-Agent': USER_AGENT }, timeout: 10000 });
    token = data.token;
    const { exp } = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    tokenExpiresAt = exp * 1000;
    return token;
}

async function search(params, retried = false) {
    const accessToken = await getToken();
    try {
        const { data } = await axios.get(`${API}/gifs/search`, {
            headers: { 'User-Agent': USER_AGENT, Authorization: `Bearer ${accessToken}` },
            params,
            timeout: 10000,
        });
        return data.gifs ?? [];
    } catch (error) {
        // The token can be revoked or tied to an old IP; get a fresh one and retry once
        if (error.response?.status === 401 && !retried) {
            await getToken(true);
            return search(params, true);
        }
        throw error;
    }
}

function remember(id) {
    recentIds.push(id);
    if (recentIds.length > RECENT_LIMIT) {
        recentIds.shift();
    }
}

const randomItem = (list) => list[Math.floor(Math.random() * list.length)];

// Returns a direct media URL for a random result that hasn't been posted recently, or null
async function searchRedgifs(searchTerms) {
    const attempts = [
        { search_text: randomItem(searchTerms), order: randomItem(ORDERS), page: 1 + Math.floor(Math.random() * MAX_PAGE) },
        { search_text: searchTerms[0], order: randomItem(ORDERS), page: 1 + Math.floor(Math.random() * MAX_PAGE) },
        { search_text: searchTerms[0], order: 'trending', page: 1 },
    ];

    try {
        for (const attempt of attempts) {
            const results = await search({ ...attempt, type: randomItem(MEDIA_TYPES), count: 80 });
            const candidates = results.filter(gif =>
                gif.urls?.hd &&
                !recentIds.includes(gif.id) &&
                !(gif.sexuality ?? []).some(s => EXCLUDED_SEXUALITY.includes(s)));
            if (candidates.length > 0) {
                const pick = randomItem(candidates);
                remember(pick.id);
                console.log(`RedGifs ${JSON.stringify(attempt)} returned ${pick.urls.hd}`);
                return pick.urls.hd;
            }
        }
        console.error(`RedGifs found nothing new for ${JSON.stringify(searchTerms)}`);
        return null;
    } catch (error) {
        console.error('Error in searchRedgifs:', error.message);
        if (error.response) {
            console.error('API Response Status:', error.response.status);
            console.error('API Response Data:', error.response.data);
        }
        return null;
    }
}

module.exports.searchRedgifs = searchRedgifs;
