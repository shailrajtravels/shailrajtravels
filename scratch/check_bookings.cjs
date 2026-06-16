const { MongoClient } = require('mongodb');
const uri = "mongodb://sanketsatras2131_db_user:P6vTV7cXAJFEauRB@ac-xn6ryey-shard-00-00.kj85wan.mongodb.net:27017,ac-xn6ryey-shard-00-01.kj85wan.mongodb.net:27017,ac-xn6ryey-shard-00-02.kj85wan.mongodb.net:27017/shailraj?replicaSet=atlas-n1co66-shard-0&ssl=true&authSource=admin&appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('shailraj');
    const bookings = await db.collection('bookings').find({}).sort({ createdAt: -1 }).limit(10).toArray();
    console.log("=== RECENT 10 BOOKINGS ===");
    bookings.forEach(b => {
      console.log(`ID: ${b._id}, Name: ${b.name}, Phone: ${b.phone}, Trip: ${b.tripName}`);
      console.log(`  createdAt:`, b.createdAt);
      console.log(`  isInvoiceLocked:`, b.isInvoiceLocked);
      console.log(`  invoiceCustomData:`, JSON.stringify(b.invoiceCustomData));
    });
  } finally {
    await client.close();
  }
}

run();
