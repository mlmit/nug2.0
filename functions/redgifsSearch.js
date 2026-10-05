const axios = require('axios');

const API = 'https://api.redgifs.com/v2';
// Temporary tokens are bound to the IP and User-Agent that requested them, so every call must send the same one
const USER_AGENT = 'nug2.0-discord-bot';
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;

// Niche feeds are curated per topic; /gifs/search ignores free text, so it can't target a body part
const ORDERS = ['hot', 'best', 'latest'];
const MEDIA_TYPES = ['g', 'i']; // g = video/gif, i = still image
const MAX_PAGE = 30;
// RedGifs "sexuality" categories to skip: animated content, and male-focused results for these searches
const EXCLUDED_SEXUALITY = ['animated', 'gay'];
// Tags for sex acts, toys and other focuses that pull results away from the requested body part
const EXCLUDED_TAGS = [
    'Anal', 'BBC', 'Big Dick', 'Blowjob', 'Cock', 'Cowgirl', 'Creampie', 'Cum', 'Cum On Ass', 'Cum On Tits',
    'Cumshot', 'Deepthroat', 'Dildo', 'Doggystyle', 'Face Sitting', 'Femboy', 'Fucking', 'Handjob', 'Hardcore',
    'Jerk Off', 'Masturbating', 'Missionary', 'Pee', 'Peeing', 'Piss', 'Pissing', 'POV', 'Pussy Eating', 'Pussy Licking',
    'Orgasm', 'Riding', 'Sex', 'Sex Toy', 'Squirt', 'Squirting', 'Threesome', 'Tit Fuck', 'Titfuck', 'Titty Fuck', 'Vibrator',
].map(t => t.toLowerCase());

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

async function getNicheGifs(niche, params, retried = false) {
    const accessToken = await getToken();
    try {
        const { data } = await axios.get(`${API}/niches/${encodeURIComponent(niche)}/gifs`, {
            headers: { 'User-Agent': USER_AGENT, Authorization: `Bearer ${accessToken}` },
            params,
            timeout: 10000,
        });
        return data.gifs ?? [];
    } catch (error) {
        // The token can be revoked or tied to an old IP; get a fresh one and retry once
        if (error.response?.status === 401 && !retried) {
            await getToken(true);
            return getNicheGifs(niche, params, true);
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

// Returns a direct media URL for a random gif from the niche that carries at least one of requiredTags,
// none of EXCLUDED_TAGS or excludedTags, and hasn't been posted recently; or null
async function searchRedgifs({ niche, requiredTags, excludedTags = [] }) {
    const required = requiredTags.map(t => t.toLowerCase());
    const excluded = [...EXCLUDED_TAGS, ...excludedTags.map(t => t.toLowerCase())];
    const attempts = [
        { order: randomItem(ORDERS), page: 1 + Math.floor(Math.random() * MAX_PAGE), type: randomItem(MEDIA_TYPES) },
        { order: randomItem(ORDERS), page: 1 + Math.floor(Math.random() * MAX_PAGE), type: randomItem(MEDIA_TYPES) },
        { order: 'hot', page: 1 },
    ];

    try {
        for (const attempt of attempts) {
            const results = await getNicheGifs(niche, { ...attempt, count: 80 });
            const candidates = results.filter(gif => {
                const tags = (gif.tags ?? []).map(t => t.toLowerCase());
                return gif.urls?.hd &&
                    !recentIds.includes(gif.id) &&
                    !(gif.sexuality ?? []).some(s => EXCLUDED_SEXUALITY.includes(s)) &&
                    tags.some(t => required.includes(t)) &&
                    !tags.some(t => excluded.includes(t));
            });
            if (candidates.length > 0) {
                const pick = randomItem(candidates);
                remember(pick.id);
                console.log(`RedGifs ${niche} ${JSON.stringify(attempt)} returned ${pick.urls.hd} (${candidates.length}/${results.length} matched)`);
                return pick.urls.hd;
            }
        }
        console.error(`RedGifs found nothing new in niche ${niche}`);
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
