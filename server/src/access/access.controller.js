import Room from '../room/room.model.js';
import crypto from 'crypto';

const generateAccessCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

export const handleCreation = async (req, res) => {
  try {
    const existingRoom = await Room.findOne();

    if(existingRoom) {
      return res.status(400).json({
        success: false,
        message: "Room already exists"
      });
    }

    const broadcasterCode = generateAccessCode();
    const viewerCode = generateAccessCode();

    const room = await Room.create({
      broadcasterCode,
      viewerCode,
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      broadcasterCode,
      viewerCode,
    });
  }
  catch(error) {
    console.log(`[Error] Access Code Creation: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
}

export const handleVerification = async (req, res) => {
  try {
    const {accessCode} = req.body;

    const room = await Room.findOne({
      $or: [
        {broadcasterCode: accessCode},
        {viewerCode: accessCode}
      ]
    });
    if(!room) {
      return res.status(401).json({
        success: false,
        message: "Invalid Access Code"
      });
    }
    const role = room.broadcasterCode === accessCode ? "broadcaster" : "viewer";

    return res.status(200).json({
      success: true,
      role
    });
  } catch(error) {
    console.error(`[Error] Access Code Verification: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
}
