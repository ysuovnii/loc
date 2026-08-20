import Room from '../room/room.model.js';

export const initLocationSocket = (io) => {
  io.on("connection", (socket) => {

    socket.on("location:update", async (location) => {
      try{
        if(socket.role !== "broadcaster") return;
  
        const {latitude, longitude, accuracy} = location;

        if(typeof latitude !== "number" || typeof longitude !== "number") return;
  
        const currentLocation = {
          latitude,
          longitude,
          accuracy, 
          updatedAt: new Date(),
        }
  
        await Room.findOneAndUpdate({}, {
          currentLocation
        });
  
        socket.to("tracking-room").emit(
          "location:update",
          currentLocation
        );
      } catch(error) {
        console.error(`[Location] Update Error: ${error}`);
      }
    });
  });
}