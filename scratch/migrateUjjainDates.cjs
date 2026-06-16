const { MongoClient } = require('mongodb');
const uri = "mongodb://sanketsatras2131_db_user:P6vTV7cXAJFEauRB@ac-xn6ryey-shard-00-00.kj85wan.mongodb.net:27017,ac-xn6ryey-shard-00-01.kj85wan.mongodb.net:27017,ac-xn6ryey-shard-00-02.kj85wan.mongodb.net:27017/shailraj?replicaSet=atlas-n1co66-shard-0&ssl=true&authSource=admin&appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('shailraj');
    
    // Find the Pune - Ujjain - Pune trip option
    const trip = await db.collection('trip_options').findOne({ name: "Pune -Ujjain-Pune" });
    if (trip) {
      console.log("Found trip option:", trip.name);
      const scheduleVal = trip.schedule || "";
      const parsedDates = scheduleVal
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      
      console.log("Parsed dates to set:", parsedDates);
      
      const result = await db.collection('trip_options').updateOne(
        { _id: trip._id },
        { 
          $set: { 
            dates: parsedDates,
            schedule: "" 
          } 
        }
      );
      
      console.log("Migration successful! Modified document count:", result.modifiedCount);
    } else {
      console.log("Trip option not found.");
    }
  } finally {
    await client.close();
  }
}

run();
