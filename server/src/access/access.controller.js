import dotenv from 'dotenv';
import crypto from 'crypto';
import {createRoom, getRoom} from '../room/room.store.js';
dotenv.config();

const generateAccessCode = () => crypto.randomBytes(4).toString('hex').toUpperCase();

export const handleCreateAccessCode = (req, res) => {
  try {
    const exsistingRoom = getRoom();

    if(exsistingRoom) {
      return res.status(400).json({
        success: false,
        message: "A tracking session is already active"
      });
    }

    const broadCasterCode = generateAccessCode();
    const viewerCode = generateAccessCode();

    createRoom(broadCasterCode, viewerCode);

    return res.status(200).json({
      success: true,
      broadCasterCode,
      viewerCode
    });
  }
  catch(error) {
    console.error(`[Error] Access Creation: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
}

export const handleVerification = (req, res) => {
  try {
    const room = getRoom();
    const {accessCode} = req.body;

    if(!accessCode) {
      return res.status(400).json({
        success: false,
        message: "Access Code is required"
      });
    }

    if(accessCode === room.broadCasterCode) {
      return res.status(200).json({
        success: true,
        role: "broadcaster",
        message: "Access Granted"
      });
    }

    if(accessCode === room.viewerCode) {
      return res.status(200).json({
        success: true,
        role: "viewer",
        message: "Access Granted"
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid Access Code"
    });
  } catch(error) {
    console.error(`[Error] Access Verification: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
}
