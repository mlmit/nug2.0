const db = require('../db/dbConnector.js');
const { findFactoid, normalizeKey, MAX_KEY_LENGTH } = require('./factoids.js');

// Statements starting with these are questions, not facts ("what is love")
const QUESTION_WORDS = /^(what|who|where|when|why|how|which)\b/;

// Parses "<key> is/are <value>", "no, <key> is <value>" and "<key> is also <value>"
function parseStatement(content) {
    const text = content.trim();
    if (!text || text.endsWith('?') || text.includes('\n')) {
        return null;
    }

    const correction = /^no,\s*(.+)$/i.exec(text);
    const body = correction ? correction[1] : text;
    const parts = /^(.+?)\s+(is|are)\s+(also\s+)?(.+)$/i.exec(body);
    if (!parts) {
        return null;
    }

    const key = normalizeKey(parts[1]);
    const verb = parts[2].toLowerCase();
    const value = parts[4].trim();
    if (!key || key.length > MAX_KEY_LENGTH || QUESTION_WORDS.test(key) || !value) {
        return null;
    }

    let mode = 'add';
    if (correction) {
        mode = 'replace';
    } else if (parts[3]) {
        mode = 'append';
    }
    // formatFactoid always says "key is value", so keep "are" by storing the whole sentence as a <reply>
    const stored = verb === 'are' ? `<reply> ${key} are ${value}` : value;
    return { key, value: stored, mode };
}

function run(sql, params) {
    return new Promise((resolve, reject) => {
        db.suxdb.run(sql, params, (err) => (err ? reject(err) : resolve()));
    });
}

// Infobot-style alternatives are joined with '|'; plain text reads better joined with ' or '
function appendValue(existing, addition) {
    const usesMarkup = /<reply>|<action>|<react>|\|/i.test(existing) || /^<reply>|^<action>|^<react>/i.test(addition);
    return `${existing.trim()}${usesMarkup ? '|' : ' or '}${addition}`;
}

// Learns from a chat message; returns an acknowledgement for corrections and additions, otherwise null.
// Plain "x is y" learning is silent and never overwrites an existing factoid, like infobot.
async function learnFactoid(content, authorId) {
    const statement = parseStatement(content);
    if (!statement) {
        return null;
    }

    const { key, value, mode } = statement;
    const existing = await findFactoid(key);

    if (!existing) {
        // Keys and values are stored with the padding the original infobot import used
        await run(
            `INSERT OR IGNORE INTO factoids (factoid_key, factoid_value, created_by, created_time, requested_count)
             VALUES (?, ?, ?, datetime('now'), 0)`,
            [`${key} `, ` ${value}`, authorId],
        );
        return mode === 'add' ? null : `OK, I'll remember "${key}".`;
    }

    if (mode === 'add') {
        return null;
    }

    const newValue = mode === 'replace' ? value : appendValue(existing.factoid_value, value);
    await run(
        `UPDATE factoids SET factoid_value = ?, created_by = ?, created_time = datetime('now') WHERE factoid_key = ?`,
        [` ${newValue}`, authorId, existing.factoid_key],
    );
    return mode === 'replace' ? `OK, "${key}" has been updated.` : `OK, added that to "${key}".`;
}

module.exports = { learnFactoid, parseStatement, appendValue };
