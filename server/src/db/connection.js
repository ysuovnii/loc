import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

export const initDB = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log(`[DB] Connected to DB`);
  }
  catch(error) {
    console.error(`[DB] Connection failed: ${error}`);
    throw error;
  }
}

export default pool;
