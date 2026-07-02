const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/openwa.sqlite'); 

const config = {
  chatFilter: {
    enabled: true,
    keywords: ['hi', 'hello', 'support', 'booking', 'help', 'enquiry'],
    caseInsensitive: true,
    ignoreExtraSpaces: true,
    matchMode: 'exact'
  }
};

db.run(`UPDATE sessions SET config = ? WHERE name = 'shailraj-bot'`, [JSON.stringify(config)], function(err) {
  if (err) {
    console.error(err);
  } else {
    console.log('Updated rows:', this.changes);
  }
});
