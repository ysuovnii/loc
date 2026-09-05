import Room from '../room/room.model.js';
import LocationHistory from '../room/locationHistory.model.js';

const LOCATION_RATE_LIMIT_MS = 1000;
const MIN_DISTANCE_METERS_FOR_HISTORY = 10; // 10 meters deadband to eliminate GPS drift/jitter
const MAX_TIME_DIFF_MS_FOR_HISTORY = 5 * 60 * 1000; // 5 minutes heartbeat even if stationary

const lastSavedPoints = new Map();

function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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

        const updateTime = new Date();
        const currentLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          updatedAt: updateTime,
        };

        const roomId = socket.roomId;
        if (roomId) {
          await Room.findByIdAndUpdate(roomId, { currentLocation });
        } else {
          await Room.findOneAndUpdate({}, { currentLocation });
        }

        // Broadcast real-time live position to viewers
        socket.to('tracking-room').emit('location:update', currentLocation);

        // Check if this point qualifies for 24-hour location history
        if (roomId) {
          let lastPoint = lastSavedPoints.get(roomId);
          if (!lastPoint) {
            lastPoint = await LocationHistory.findOne({ roomId }).sort({ timestamp: -1 });
            if (lastPoint) {
              lastSavedPoints.set(roomId, {
                latitude: lastPoint.latitude,
                longitude: lastPoint.longitude,
                timestamp: lastPoint.timestamp,
              });
            }
          }

          let shouldSave = false;
          if (!lastPoint) {
            shouldSave = true;
          } else {
            const distance = calculateDistanceMeters(
              lastPoint.latitude,
              lastPoint.longitude,
              location.latitude,
              location.longitude
            );
            const timeDiff = now - new Date(lastPoint.timestamp).getTime();

            if (distance >= MIN_DISTANCE_METERS_FOR_HISTORY || timeDiff >= MAX_TIME_DIFF_MS_FOR_HISTORY) {
              shouldSave = true;
            }
          }

          if (shouldSave) {
            const historyEntry = await LocationHistory.create({
              roomId,
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy,
              speed: location.speed,
              timestamp: updateTime,
            });

            lastSavedPoints.set(roomId, {
              latitude: location.latitude,
              longitude: location.longitude,
              timestamp: updateTime,
            });

            const historyPointPayload = {
              _id: historyEntry._id,
              latitude: historyEntry.latitude,
              longitude: historyEntry.longitude,
              accuracy: historyEntry.accuracy,
              timestamp: historyEntry.timestamp,
            };

            // Broadcast new history breadcrumb to viewers and broadcaster
            io.to('tracking-room').emit('location:history-point', historyPointPayload);
          }
        }
      } catch (error) {
        console.error(`[Location] Update Error: ${error.message}`);
      }
    });
  });
};

