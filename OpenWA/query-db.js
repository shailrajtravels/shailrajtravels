const sqlite3 = require('sqlite3').verbose();
const dbPath = 'C:\\Users\\ASUS\\OneDrive\\Pictures\\ドキュメント\\Desktop\\shailraj\\OpenWA\\data\\openwa.sqlite';
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.all("SELECT id, body, direction, timestamp FROM messages WHERE chatId = '29905890889924@lid'", (err, rows) => {
    if (err) throw err;
    console.log(JSON.stringify(rows, null, 2));
  });
});
