import dotenv from 'dotenv';
import crypto from 'node:crypto';
import initDB from '../config/db.js';
import Room from '../room/room.model.js';

dotenv.config();

const generateAccessCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

async function run() {
  console.log('[Setup] Connecting to MongoDB...');
  await initDB();

  const room = await Room.findOne();
  if (room) {
    console.log('\n===========================================');
    console.log('✅ Found Existing Tracking Room:');
    console.log('Broadcaster Code (Phone/GPS Sender):', room.broadcasterCode);
    console.log('Viewer Code      (Map Watcher):     ', room.viewerCode);
    console.log('===========================================\n');
    process.exit(0);
  }

  const broadcasterCode = generateAccessCode();
  const viewerCode = generateAccessCode();

  const newRoom = await Room.create({
    broadcasterCode,
    viewerCode,
  });

  console.log('\n===========================================');
  console.log('🎉 New Tracking Room Created Successfully:');
  console.log('Broadcaster Code (Phone/GPS Sender):', newRoom.broadcasterCode);
  console.log('Viewer Code      (Map Watcher):     ', newRoom.viewerCode);
  console.log('===========================================\n');
  process.exit(0);
}

run().catch((err) => {
  console.error('[Error] Could not initialize room:', err.message);
  process.exit(1);
});
