const { MongoClient } = require('mongodb');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function main() {
  const uri = "mongodb+srv://ganeshsatwikthadaka18_db_user:mkPFOGsGg5lPoJUj@sashvogue.qc1zcdz.mongodb.net/?appName=sashvogue";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('test');
    
    // Collections to clear completely
    const clearCollections = [
      'orders',
      'payments',
      'addresses',
      'supporttickets',
      'products',
      'coupons',
      'notifications'
    ];
    
    console.log("Starting cleanup...");

    for (const col of clearCollections) {
      console.log(`Clearing ${col}...`);
      const result = await db.collection(col).deleteMany({});
      console.log(`  Deleted ${result.deletedCount} documents.`);
    }

    // Filter users: delete everyone except dyhardeveloper@gmail.com
    console.log("Filtering users...");
    const userResult = await db.collection('users').deleteMany({
      email: { $ne: "dyhardeveloper@gmail.com" }
    });
    console.log(`  Deleted ${userResult.deletedCount} demo users.`);

    console.log("Cleanup finished successfully!");

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main();
