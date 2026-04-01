const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  let url = process.env.DATABASE_URL || "";
  console.log("🔍 Testing connection to:", url.split('@')[1] || "No URL");

  const client = new Client({
    connectionString: url,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("✅ Standard PG Client connected successfully!");
    const res = await client.query('SELECT NOW()');
    console.log("🕒 DB Time:", res.rows[0].now);
    await client.end();
    return true;
  } catch (err) {
    console.error("❌ Standard PG Client failed:", err.message);
    return false;
  }
}

testConnection();
