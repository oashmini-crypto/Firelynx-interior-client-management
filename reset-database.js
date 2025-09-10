// Reset database by dropping all tables
const { Client } = require('pg');

async function resetDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Drop all tables in the public schema
    const dropTablesQuery = `
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `;
    
    await client.query(dropTablesQuery);
    console.log('✅ All tables dropped successfully');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await client.end();
  }
}

resetDatabase();