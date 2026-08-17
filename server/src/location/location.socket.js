import {getRoom} from '../room/room.store.js';

export const initLocationSocket = (io) => {
  io.on("connection", (socket) => {

    socket.on("location:update", (location) => {
      const room = getRoom();
      const {latitude, longitude} = location;

      if(!room) return;
      if(socket.role !== "broadcaster") return;
      if(typeof latitude !== "number" ||typeof longitude !== "number") return;

      room.currentLocation = {
        latitude,
        longitude,
        timestamp: Date.now()
      }

      socket.broadcast.emit("location:update", room.currentLocation);
    });
  });
}
