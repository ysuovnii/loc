import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
    index: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  accuracy: {
    type: Number,
  },
  speed: {
    type: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    // 24 hours TTL: 24 * 60 * 60 = 86400 seconds.
    // MongoDB automatically removes documents older than 24 hours.
    expires: 86400,
    index: true,
  },
});

const History = mongoose.models.LocationHistory || mongoose.model('LocationHistory', historySchema);

export { History as LocationHistory };
export default History;
