import Room from '../room/room.model.js';
import History from './history.model.js';

export const getHistory = async (req, res) => {
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
    const history = await History.find({
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

export const handleGetHistory = getHistory;
