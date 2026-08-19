import mongoose from 'mongoose';
import 'dotenv/config';

const initDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log(`[DB] Connected to DB`);
  } catch(error) {
    console.error(`[Error] Failed to connect with DB: ${error}`);
    process.exit(1);
  }
}

export default initDB;
