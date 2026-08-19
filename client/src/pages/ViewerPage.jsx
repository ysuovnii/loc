import { useEffect, useRef, useState } from 'react';
import MapView from '../components/Map';
import ProfileCard from '../components/ProfileCard';
import { createSocket } from '../services/socket';
import { reverseGeocode } from '../utils/reverseGeocode';

export default function ViewerPage({ accessCode }) {
  const socketRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [phase, setPhase] = useState('searching');

  useEffect(() => {
    const socket = createSocket(accessCode);
    socketRef.current = socket;

    const onLocationUpdate = (data) => {
      const loc = {
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp ?? Date.now(),
      };
      setLocation(loc);
      reverseGeocode(loc.latitude, loc.longitude).then(setLocationName);

      if (phase === 'searching') {
        setPhase('found');
        setTimeout(() => setPhase('live'), 600);
      }
    };

    socket.on('location:update', onLocationUpdate);
    socket.connect();

    return () => {
      socket.off('location:update', onLocationUpdate);
      socket.disconnect();
    };
  }, [accessCode]);

  const showOverlay = phase !== 'live';
  const loadingText =
    phase === 'found' ? 'BROADCASTER FOUND' : 'LOCATING BROADCASTER...';

  return (
    <div className="page map-page dashboard-enter">
      <main className="dashboard-main">
        <MapView
          latitude={location?.latitude}
          longitude={location?.longitude}
          label="DOODHVAALA"
          loadingText={loadingText}
          showOverlay={showOverlay}
          loadingFound={phase === 'found'}
        />
      </main>

      <ProfileCard location={location} locationName={locationName} />
    </div>
  );
}
