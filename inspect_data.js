const { MongoClient } = require('mongodb');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function main() {
  const uri = "mongodb+srv://ganeshsatwikthadaka18_db_user:mkPFOGsGg5lPoJUj@sashvogue.qc1zcdz.mongodb.net/?appName=sashvogue";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('test');
    
    const collections = ['users', 'products', 'orders', 'banners', 'categories', 'coupons'];
    for (const col of collections) {
      console.log(`\n--- Collection: ${col} ---`);
      const docs = await db.collection(col).find({}).limit(2).toArray();
      docs.forEach(d => console.log(JSON.stringify(d).substring(0, 150) + "..."));
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main();
