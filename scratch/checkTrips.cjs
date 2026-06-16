const { MongoClient } = require('mongodb');
const uri = "mongodb://sanketsatras2131_db_user:P6vTV7cXAJFEauRB@ac-xn6ryey-shard-00-00.kj85wan.mongodb.net:27017,ac-xn6ryey-shard-00-01.kj85wan.mongodb.net:27017,ac-xn6ryey-shard-00-02.kj85wan.mongodb.net:27017/shailraj?replicaSet=atlas-n1co66-shard-0&ssl=true&authSource=admin&appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('shailraj');
    const options = await db.collection('trip_options').find({}).toArray();
    console.log("=== TRIP OPTIONS IN DB ===");
    options.forEach(opt => {
      console.log(`ID: ${opt._id}, Name: ${opt.name}`);
      console.log(`  Dates:`, opt.dates, typeof opt.dates);
      console.log(`  Schedule:`, opt.schedule, typeof opt.schedule);
    });
  } finally {
    await client.close();
  }
}

run();
