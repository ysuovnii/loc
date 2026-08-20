import Room from '../room/room.model.js';
import { initLocationSocket } from './location.socket.js';
import { ACCESS_CODE_REGEX } from '../access/access.middleware.js';

export const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const { accessCode } = socket.handshake.auth;

      if (!accessCode || typeof accessCode !== 'string') {
        return next(new Error('Access code is required'));
      }

      const trimmed = accessCode.trim();

      if (!ACCESS_CODE_REGEX.test(trimmed)) {
        return next(new Error('Invalid access code'));
      }

      const normalizedCode = trimmed.toUpperCase();

      const room = await Room.findOne();
      if (!room) return next(new Error('No active tracking session'));

      if (normalizedCode === room.broadcasterCode) {
        socket.role = 'broadcaster';
      } else if (normalizedCode === room.viewerCode) {
        socket.role = 'viewer';
      } else {
        console.warn(`[Security] Socket auth failed from ${socket.handshake.address}`);
        return next(new Error('Invalid access code'));
      }

      socket.roomId = room._id.toString();
      socket.room = room;
      next();
    } catch (error) {
      console.error(`[Socket] Auth Error: ${error.message}`);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id} (role: ${socket.role})`);
    socket.join('tracking-room');

    if (socket.role === 'viewer' && socket.room?.currentLocation) {
      socket.emit('location:update', socket.room.currentLocation);
    }

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });

  initLocationSocket(io);
};
