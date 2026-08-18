import { useEffect, useRef, useState } from 'react';
import MapView from '../components/Map';
import ProfileCard from '../components/ProfileCard';
import { createSocket } from '../services/socket';
import { reverseGeocode } from '../utils/reverseGeocode';

export default function ViewerPage({ accessCode }) {
  const socketRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    const socket = createSocket(accessCode);
    socketRef.current = socket;

    const onConnect = () => {};
    const onDisconnect = () => {};
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
    socket.on('disconnect', onDisconnect);
    socket.on('location:update', onLocationUpdate);

    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('location:update', onLocationUpdate);
      socket.disconnect();
    };
  }, [accessCode]);

  return (
    <div className="page map-page dashboard-enter">
      <main className="dashboard-main">
        <MapView
          latitude={location?.latitude}
          longitude={location?.longitude}
          label="YOU"
        />
      </main>

      <ProfileCard location={location} locationName={locationName} />
    </div>
  );
}
