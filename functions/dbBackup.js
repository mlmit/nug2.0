const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('sqlite3');
const db = require('../db/dbConnector.js');

const BACKUP_DIR = path.resolve(__dirname, '../db/backups');
const KEEP_COPIES = 5;
const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
// Check hourly rather than relying on one 24h timer, so restarts don't delay or repeat backups
const CHECK_INTERVAL_MS = 60 * 60 * 1000;

const DATABASES = [
    { name: 'doomsux', connection: () => db.suxdb },
    { name: 'seen', connection: () => db.seendb },
];

let running = false;

// Backup files are named like doomsux-20261004T170000Z.sqlite, so they sort oldest to newest
function listBackups(name) {
    const pattern = new RegExp(`^${name}-\\d{8}T\\d{6}Z\\.sqlite$`);
    return fs.readdirSync(BACKUP_DIR).filter(file => pattern.test(file)).sort();
}

function isDue(name) {
    const backups = listBackups(name);
    if (backups.length === 0) {
        return true;
    }
    const newest = fs.statSync(path.join(BACKUP_DIR, backups[backups.length - 1]));
    return Date.now() - newest.mtimeMs >= BACKUP_INTERVAL_MS;
}

function run(connection, sql, params = []) {
    return new Promise((resolve, reject) => {
        connection.run(sql, params, (err) => (err ? reject(err) : resolve()));
    });
}

function quickCheck(file) {
    return new Promise((resolve, reject) => {
        const backup = new sqlite3.Database(file, sqlite3.OPEN_READONLY, (openErr) => {
            if (openErr) {
                return reject(openErr);
            }
            backup.get('PRAGMA quick_check', (err, row) => {
                backup.close();
                if (err) {
                    return reject(err);
                }
                const result = row && Object.values(row)[0];
                return result === 'ok' ? resolve() : reject(new Error(`quick_check failed: ${result}`));
            });
        });
    });
}

async function backupDatabase({ name, connection }) {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    const finalPath = path.join(BACKUP_DIR, `${name}-${stamp}.sqlite`);
    const tempPath = `${finalPath}.tmp`;

    try {
        // VACUUM INTO writes a consistent snapshot even while the bot is using the database
        await run(connection(), 'VACUUM INTO ?', [tempPath]);
        await quickCheck(tempPath);
        fs.renameSync(tempPath, finalPath);
    } catch (error) {
        fs.rmSync(tempPath, { force: true });
        throw error;
    }

    // Only prune once the new backup is safely in place
    const backups = listBackups(name);
    for (const old of backups.slice(0, Math.max(0, backups.length - KEEP_COPIES))) {
        fs.rmSync(path.join(BACKUP_DIR, old), { force: true });
    }

    const bytes = fs.statSync(finalPath).size;
    const size = bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
    console.log(`Backed up ${name} database to ${path.basename(finalPath)} (${size}, keeping ${Math.min(backups.length, KEEP_COPIES)})`);
}

async function runDueBackups() {
    if (running) {
        return;
    }
    running = true;
    try {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        // Clear out temp files left behind if the bot was killed mid-backup
        for (const file of fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.sqlite.tmp'))) {
            fs.rmSync(path.join(BACKUP_DIR, file), { force: true });
        }
        for (const database of DATABASES) {
            if (!isDue(database.name)) {
                continue;
            }
            try {
                await backupDatabase(database);
            } catch (error) {
                console.error(`Error backing up ${database.name} database:`, error.message);
            }
        }
    } catch (error) {
        console.error('Error running database backups:', error.message);
    } finally {
        running = false;
    }
}

function startBackupSchedule() {
    runDueBackups();
    setInterval(runDueBackups, CHECK_INTERVAL_MS);
}

module.exports = { startBackupSchedule, runDueBackups, BACKUP_DIR, KEEP_COPIES };
