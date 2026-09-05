import Room from '../room/room.model.js';
import LocationHistory from '../room/locationHistory.model.js';
import crypto from 'node:crypto';

const generateAccessCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

export const handleCreation = async (req, res) => {
  try {
    const existingRoom = await Room.findOne();

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'Room already exists',
      });
    }

    const broadcasterCode = generateAccessCode();
    const viewerCode = generateAccessCode();

    await Room.create({
      broadcasterCode,
      viewerCode,
    });

    console.log('[Access] Room created');

    return res.status(201).json({
      success: true,
      message: 'Room created successfully',
      broadcasterCode,
      viewerCode,
    });
  } catch (error) {
    console.error(`[Error] Access Code Creation: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const handleVerification = async (req, res) => {
  try {
    const { accessCode } = req.body;

    const room = await Room.findOne({
      $or: [
        { broadcasterCode: accessCode },
        { viewerCode: accessCode },
      ],
    });

    if (!room) {
      console.warn(`[Security] Failed verification from ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid access code',
      });
    }

    const role = room.broadcasterCode === accessCode ? 'broadcaster' : 'viewer';

    return res.status(200).json({
      success: true,
      role,
    });
  } catch (error) {
    console.error(`[Error] Access Code Verification: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const handleGetHistory = async (req, res) => {
  try {
    const accessCode = (req.query.accessCode || req.headers['x-access-code'] || '').trim().toUpperCase();

    if (!accessCode) {
      return res.status(400).json({
        success: false,
        message: 'Access code is required',
      });
    }

    const room = await Room.findOne({
      $or: [
        { broadcasterCode: accessCode },
        { viewerCode: accessCode },
      ],
    });

    if (!room) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access code',
      });
    }

    // Query points from the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const history = await LocationHistory.find({
      roomId: room._id,
      timestamp: { $gte: oneDayAgo },
    })
      .sort({ timestamp: 1 })
      .select('latitude longitude accuracy timestamp')
      .lean();

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error(`[Error] Location History: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

