const sqlite3 = require('sqlite3').verbose();
const { dbPathSux } = require('../paths.json');

let suxdb = new sqlite3.Database(dbPathSux, (err) => {
    if (err) {
        console.log(err.message);
    }
    console.log(`Connected to doomsux database`);
});

let seendb = new sqlite3.Database('/home/mark/nug/db/seen.sqlite', (err) => {
    if (err) {
        console.log(err.message);
    }
    console.log(`Connected to seen database`);
});

module.exports = { suxdb, seendb };
