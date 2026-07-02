const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

async function run() {
  const rulesPath = 'C:\\Users\\ASUS\\OneDrive\\Pictures\\ドキュメント\\Desktop\\shailraj\\chatbot-rules.json';
  const dbPath = 'C:\\Users\\ASUS\\OneDrive\\Pictures\\ドキュメント\\Desktop\\shailraj\\OpenWA\\data\\openwa.sqlite';

  const rulesData = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
  let keywords = [];
  for (const rule of rulesData.rules) {
    keywords.push(...rule.keywords.map(k => k.toLowerCase().trim()));
  }

  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    db.all("SELECT DISTINCT chatId FROM messages", (err, rows) => {
      if (err) throw err;
      let toDelete = [];
      let totalChats = rows.length;
      console.log(`Total chats in DB: ${totalChats}`);
      
      let processed = 0;
      for (const row of rows) {
        db.all("SELECT body, direction FROM messages WHERE chatId = ?", [row.chatId], (err, msgs) => {
          if (err) throw err;
          
          let isBusiness = false;
          for (const m of msgs) {
            if (m.direction === 'INCOMING' && m.body) {
              const text = m.body.toLowerCase().trim();
              if (keywords.some(k => text === k)) {
                isBusiness = true;
                break;
              }
            }
          }
          
          if (!isBusiness) {
            toDelete.push(row.chatId);
          }
          
          processed++;
          if (processed === totalChats) {
            console.log(`Found ${toDelete.length} personal chats to delete.`);
            if (toDelete.length > 0) {
              const placeholders = toDelete.map(() => '?').join(',');
              db.run(`DELETE FROM messages WHERE chatId IN (${placeholders})`, toDelete, function(err) {
                if (err) throw err;
                console.log(`Deleted ${this.changes} personal messages from DB.`);
              });
            } else {
              console.log('No personal messages to delete.');
            }
          }
        });
      }
    });
  });
}

run();
