import {initLocationSocket} from '../location/location.socket.js';
import {getRoom} from '../room/room.store.js';

export const initSocket = (io) => {

  io.use((socket, next) => {
    const {accessCode} = socket.handshake.auth;
    const room = getRoom();

    if(!accessCode) return next(new Error("Access code is required"));

    if(!room) return next(new Error("No active tracking session"));

    if(accessCode === room.broadCasterCode) {
      socket.role = "broadcaster";
      return next();
    }

    if(accessCode === room.viewerCode) {
      socket.role = "viewer";
      return next();
    }

    return next(new Error("Invalid Access Code"));
  });


  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  initLocationSocket(io);
}
