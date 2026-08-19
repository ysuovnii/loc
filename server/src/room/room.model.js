import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  broadcasterCode: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  viewerCode: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Room = mongoose.model('Room', roomSchema);

export default Room;
