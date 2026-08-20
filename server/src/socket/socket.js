import Room from '../room/room.model.js';
import {initLocationSocket} from './location.socket.js';

export const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const {accessCode} = socket.handshake.auth;
  
      if(!accessCode) return next(new Error("Access code is required"));
  
      const room = await Room.findOne();
      if(!room) return next(new Error("No active tracking session"));
  
      if(accessCode === room.broadcasterCode) {
        socket.role = "broadcaster";
      } else if(accessCode === room.viewerCode) {
        socket.role = "viewer";
      } else {
        return next(new Error("Invalid Access Code"));
      }
    
      socket.room = room; 
      next();
    } catch(error) {
      console.error(`[Socket] Auth Error: ${error}`);
      next(new Error("Authentication Failed"));
    }
  });
  
  io.on("connection", async (socket) => {
    console.log(`[Socket] Client Connected: ${socket.id}`);
    socket.join("tracking-room");
  
    if(socket.role === "viewer" && socket.room?.currentLocation) {
      socket.emit("location:update", socket.room.currentLocation);
    }
  
    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  initLocationSocket(io);
}
