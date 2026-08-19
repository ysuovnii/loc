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

function mapGeoError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'LOCATION PERMISSION DENIED';
    case error.POSITION_UNAVAILABLE:
      return 'LOCATION UNAVAILABLE';
    case error.TIMEOUT:
      return 'GPS TIMEOUT';
    default:
      return 'LOCATION ERROR';
  }
}

export default function BroadcasterPage({ accessCode }) {
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const locationRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [viewerMarkers, setViewerMarkers] = useState([]);

  const emitLocation = useCallback((latitude, longitude) => {
    const timestamp = Date.now();
    const next = { latitude, longitude, timestamp };
    locationRef.current = next;
    setLocation(next);

    if (socketRef.current?.connected) {
      socketRef.current.emit('location:update', { latitude, longitude });
    }

    reverseGeocode(latitude, longitude).then(setLocationName);
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

    const onViewerUpdate = (data) => {
      setViewerMarkers((prev) => {
        const idx = prev.findIndex((v) => v.id === data.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { id: data.id, latitude: data.latitude, longitude: data.longitude };
          return next;
        }
        return [...prev, { id: data.id, latitude: data.latitude, longitude: data.longitude }];
      });
    };

    const onViewerLeave = (data) => {
      setViewerMarkers((prev) => prev.filter((v) => v.id !== data.id));
    };

    socket.on('connect', onConnect);
    socket.on('viewer:update', onViewerUpdate);
    socket.on('viewer:leave', onViewerLeave);
    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('viewer:update', onViewerUpdate);
      socket.off('viewer:leave', onViewerLeave);
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
          label="YOU"
          viewerMarkers={viewerMarkers}
        />
      </main>

      <ProfileCard location={location} locationName={locationName} />
    </div>
  );
}
