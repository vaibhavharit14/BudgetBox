const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  let url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DB_URL || "";
  console.log("🔍 Testing connection to:", url.split('@')[1] || "No URL found in ENV!");
  if (!url) process.exit(1);

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
    process.exit(0); // Success
  } catch (err) {
    console.error("❌ Standard PG Client failed:", err.message);
    process.exit(1); // Fail the build
  }
}

testConnection();
