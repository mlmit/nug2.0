const sqlite3 = require('sqlite3').verbose();

let suxdb = new sqlite3.Database('/home/mark/nug/db/doomsux.sqlite', (err) => {
    if (err) {
        console.log(err.message);
    }
    console.log(`Connected to doomsux database`);
});

let seendb = new sqlite3.Database('seen.sqlite', (err) => {
    if (err) {
        console.log(err.message);
    }
    console.log(`Connected to seen database`);
});

module.exports = { suxdb, seendb };
