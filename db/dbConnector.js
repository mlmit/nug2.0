const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { dbPathSux, dbPathSeen } = require('../paths.json');

// paths.json entries are relative to the repo root
const rootDir = path.resolve(__dirname, '..');

let suxdb = new sqlite3.Database(path.resolve(rootDir, dbPathSux), (err) => {
    if (err) {
        console.log(err.message);
    }
    console.log(`Connected to doomsux database`);
});

let seendb = new sqlite3.Database(path.resolve(rootDir, dbPathSeen), (err) => {
    if (err) {
        console.log(err.message);
    }
    console.log(`Connected to seen database`);
});

module.exports = { suxdb, seendb };
