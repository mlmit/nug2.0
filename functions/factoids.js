const db = require('../db/dbConnector.js');

const MAX_KEY_LENGTH = 128;
const DISCORD_MAX_LENGTH = 2000;

// Turns a chat message into a lookup key: trimmed, lowercased, one trailing '?' removed
function normalizeKey(content) {
    return content.trim().replace(/\?$/, '').trim().toLowerCase();
}

// Keys were imported from infobot with a trailing space, so match with and without it
function keyVariants(key) {
    return [key, `${key} `, `${key}  `];
}

function findFactoid(key) {
    return new Promise((resolve, reject) => {
        db.suxdb.get(
            `SELECT factoid_key, factoid_value FROM factoids WHERE factoid_key IN (?, ?, ?) LIMIT 1`,
            keyVariants(key),
            (err, row) => (err ? reject(err) : resolve(row)),
        );
    });
}

// Deletes every stored variant of the key; returns { key, value } of the forgotten factoid, or null
async function forgetFactoid(content) {
    const key = normalizeKey(content);
    if (!key || key.length > MAX_KEY_LENGTH) {
        return null;
    }

    const row = await findFactoid(key);
    if (!row) {
        return null;
    }

    await new Promise((resolve, reject) => {
        db.suxdb.run(
            `DELETE FROM factoids WHERE factoid_key IN (?, ?, ?)`,
            keyVariants(key),
            (err) => (err ? reject(err) : resolve()),
        );
    });
    return { key: row.factoid_key.trim(), value: row.factoid_value.trim() };
}

// storedKey is the factoid_key exactly as stored (with its trailing space)
function incrementRequestedCount(storedKey) {
    db.suxdb.run(
        `UPDATE factoids SET requested_count = requested_count + 1 WHERE factoid_key = ?`,
        [storedKey],
        (err) => {
            if (err) {
                console.error('Error updating factoid requested_count:', err.message);
            }
        },
    );
}

// Infobot markup: '|' separates random alternatives (but not the ':|' emoticon),
// '<reply> x' sends x, '<action> x' sends *x*, '$who' is the asker, anything else is "key is value"
function formatFactoid(key, value, who) {
    const alternatives = value.split(/(?<!:)\|/).map(alt => alt.trim()).filter(Boolean);
    if (alternatives.length === 0) {
        return null;
    }

    const choice = alternatives[Math.floor(Math.random() * alternatives.length)].replace(/\$who/g, who);
    let text;
    if (/^<reply>/i.test(choice)) {
        text = choice.replace(/^<reply>\s*/i, '');
    } else if (/^<action>/i.test(choice)) {
        text = `*${choice.replace(/^<action>\s*/i, '')}*`;
    } else {
        text = `${key} is ${choice}`;
    }

    text = text.trim();
    if (!text) {
        return null;
    }
    return text.length > DISCORD_MAX_LENGTH ? `${text.slice(0, DISCORD_MAX_LENGTH - 1)}…` : text;
}

// Returns the reply text for a message, or null if it doesn't match a factoid
async function getFactoidReply(content, who) {
    const key = normalizeKey(content);
    if (!key || key.length > MAX_KEY_LENGTH) {
        return null;
    }

    const row = await findFactoid(key);
    // '\N' is a NULL left over from the original export
    if (!row || row.factoid_value.trim() === '\\N') {
        return null;
    }
    const reply = formatFactoid(row.factoid_key.trim(), row.factoid_value, who);
    if (reply) {
        incrementRequestedCount(row.factoid_key);
    }
    return reply;
}

// Returns { key, value, createdBy, createdTime } of a random factoid, or null if there are none.
// ORDER BY random() scans the table, but that's ~50ms for the ~240k imported rows.
function getRandomFactoid() {
    return new Promise((resolve, reject) => {
        db.suxdb.get(
            `SELECT factoid_key, factoid_value, created_by, created_time FROM factoids
             WHERE trim(factoid_value) != '\\N' ORDER BY random() LIMIT 1`,
            (err, row) => {
                if (err) {
                    return reject(err);
                }
                if (!row) {
                    return resolve(null);
                }
                resolve({
                    key: row.factoid_key.trim(),
                    value: row.factoid_value,
                    createdBy: parseCreatedBy(row.created_by),
                    createdTime: parseCreatedTime(row.created_time),
                });
            },
        );
    });
}

// created_by is a Discord user ID, or '\N'/empty for most infobot imports
function parseCreatedBy(createdBy) {
    return /^\d+$/.test(createdBy ?? '') ? createdBy : null;
}

// created_time is unix seconds (imports), 'YYYY-MM-DD HH:MM:SS' UTC (learned via datetime('now')), or '\N';
// returns unix seconds or null
function parseCreatedTime(createdTime) {
    if (typeof createdTime === 'number') {
        return createdTime;
    }
    const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(createdTime ?? '');
    if (!match) {
        return null;
    }
    const [, y, mo, d, h, mi, s] = match.map(Number);
    return Math.floor(Date.UTC(y, mo - 1, d, h, mi, s) / 1000);
}

module.exports = { getFactoidReply, getRandomFactoid, forgetFactoid, findFactoid, normalizeKey, formatFactoid, MAX_KEY_LENGTH };
