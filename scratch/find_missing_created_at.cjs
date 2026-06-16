const { MongoClient } = require('mongodb');
const uri = "mongodb://sanketsatras2131_db_user:P6vTV7cXAJFEauRB@ac-xn6ryey-shard-00-00.kj85wan.mongodb.net:27017,ac-xn6ryey-shard-00-01.kj85wan.mongodb.net:27017,ac-xn6ryey-shard-00-02.kj85wan.mongodb.net:27017/shailraj?replicaSet=atlas-n1co66-shard-0&ssl=true&authSource=admin&appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('shailraj');
    const bookings = await db.collection('bookings').find({}).toArray();
    console.log(`Total bookings found: ${bookings.length}`);
    let missingCount = 0;
    bookings.forEach(b => {
      if (!b.createdAt) {
        missingCount++;
        console.log(`Missing createdAt: ID: ${b._id}, Name: ${b.name}, Trip: ${b.tripName}`);
      }
    });
    console.log(`Total missing: ${missingCount}`);
  } finally {
    await client.close();
  }
}

run();
