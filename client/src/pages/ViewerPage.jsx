import { useCallback, useEffect, useRef, useState } from 'react';
import MapView from '../components/Map';
import ProfileCard from '../components/ProfileCard';
import { createSocket } from '../services/socket';
import { reverseGeocode } from '../utils/reverseGeocode';

const GPS_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 5000,
  timeout: 15000,
};

export default function ViewerPage({ accessCode }) {
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const locationRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');

  const emitLocation = useCallback((latitude, longitude) => {
    const timestamp = Date.now();
    const next = { latitude, longitude, timestamp };
    locationRef.current = next;
    setLocation(next);

    if (socketRef.current?.connected) {
      socketRef.current.emit('location:update', { latitude, longitude });
    }
  }, []);

  useEffect(() => {
    const socket = createSocket(accessCode);
    socketRef.current = socket;

    const onConnect = () => {
      const current = locationRef.current;
      if (current?.latitude != null && current?.longitude != null) {
        socket.emit('location:update', {
          latitude: current.latitude,
          longitude: current.longitude,
        });
      }
    };

    const onLocationUpdate = (data) => {
      const loc = {
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp ?? Date.now(),
      };
      setLocation(loc);
      reverseGeocode(loc.latitude, loc.longitude).then(setLocationName);
    };

    socket.on('connect', onConnect);
    socket.on('location:update', onLocationUpdate);
    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('location:update', onLocationUpdate);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessCode]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        emitLocation(position.coords.latitude, position.coords.longitude);
      },
      () => {},
      GPS_OPTIONS,
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [emitLocation]);

  return (
    <div className="page map-page dashboard-enter">
      <main className="dashboard-main">
        <MapView
          latitude={location?.latitude}
          longitude={location?.longitude}
          label="DOODHVAALA"
          zoomOnFirst
        />
      </main>

      <ProfileCard location={location} locationName={locationName} />
    </div>
  );
}
