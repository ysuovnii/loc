import Room from '../room/room.model.js';

const LOCATION_RATE_LIMIT_MS = 1000;

function validateLocation(location) {
  if (!location || typeof location !== 'object') return false;
  if (Array.isArray(location)) return false;

  const { latitude, longitude, accuracy } = location;

  if (typeof latitude !== 'number' || !Number.isFinite(latitude)) return false;
  if (typeof longitude !== 'number' || !Number.isFinite(longitude)) return false;
  if (accuracy !== undefined && (typeof accuracy !== 'number' || !Number.isFinite(accuracy) || accuracy < 0)) return false;

  if (latitude < -90 || latitude > 90) return false;
  if (longitude < -180 || longitude > 180) return false;

  return true;
}

export const initLocationSocket = (io) => {
  io.on('connection', (socket) => {
    let lastLocationTime = 0;

    socket.on('location:update', async (location) => {
      try {
        if (socket.role !== 'broadcaster') {
          console.warn(`[Security] Unauthorized location:update from ${socket.id} (role: ${socket.role})`);
          return;
        }

        const now = Date.now();
        if (now - lastLocationTime < LOCATION_RATE_LIMIT_MS) {
          return;
        }
        lastLocationTime = now;

        if (!validateLocation(location)) {
          console.warn(`[Security] Invalid location payload from ${socket.id}`);
          return;
        }

        const currentLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          updatedAt: new Date(),
        };

        await Room.findOneAndUpdate({}, { currentLocation });

        socket.to('tracking-room').emit('location:update', currentLocation);
      } catch (error) {
        console.error(`[Location] Update Error: ${error.message}`);
      }
    });
  });
};
