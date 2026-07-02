const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/openwa.sqlite'); 

db.serialize(() => {
  db.get("SELECT id FROM sessions WHERE name = 'shailraj-bot'", (err, row) => {
    if (err) throw err;
    if (!row) {
      console.log('Session not found');
      return;
    }
    const sessionId = row.id;
    console.log(`Clearing messages for session ${sessionId}...`);
    
    db.run("DELETE FROM messages WHERE sessionId = ?", [sessionId], function(err) {
      if (err) throw err;
      console.log(`Deleted ${this.changes} messages.`);
    });
  });
});
