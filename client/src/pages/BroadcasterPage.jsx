import { useCallback, useEffect, useRef, useState } from 'react';
import MapView from '../components/Map';
import StatusIndicator from '../components/StatusIndicator';
import LocationInfo from '../components/LocationInfo';
import { createSocket } from '../services/socket';

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
  const [gpsStatus, setGpsStatus] = useState('WAITING FOR LOCATION');
  const [socketStatus, setSocketStatus] = useState('CONNECTING');
  const [, setTick] = useState(0);

  const emitLocation = useCallback((latitude, longitude) => {
    const timestamp = Date.now();
    const next = { latitude, longitude, timestamp };
    locationRef.current = next;
    setLocation(next);
    setGpsStatus('LIVE');

    if (socketRef.current?.connected) {
      socketRef.current.emit('location:update', { latitude, longitude });
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const socket = createSocket(accessCode);
    socketRef.current = socket;

    const onConnect = () => {
      setSocketStatus('LIVE');
      const current = locationRef.current;
      if (current?.latitude != null && current?.longitude != null) {
        socket.emit('location:update', {
          latitude: current.latitude,
          longitude: current.longitude,
        });
      }
    };
    const onDisconnect = () => setSocketStatus('DISCONNECTED');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', () => setSocketStatus('DISCONNECTED'));

    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessCode]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('GPS NOT SUPPORTED');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        emitLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setGpsStatus(mapGeoError(error));
      },
      GPS_OPTIONS,
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [emitLocation]);

  const trackingStatus =
    socketStatus === 'DISCONNECTED'
      ? 'DISCONNECTED'
      : gpsStatus === 'LIVE'
        ? 'LIVE'
        : gpsStatus;

  const statusVariant =
    trackingStatus === 'LIVE'
      ? 'live'
      : trackingStatus === 'DISCONNECTED'
        ? 'disconnected'
        : gpsStatus.includes('DENIED')
          ? 'denied'
          : 'waiting';

  return (
    <div className="page dashboard-page broadcaster-page">
      <header className="dashboard-header">
        <h1 className="dashboard-title">LOCATION TRACKER</h1>
        <StatusIndicator status="BROADCASTING" variant="live" />
      </header>

      <main className="dashboard-main">
        <MapView
          latitude={location?.latitude}
          longitude={location?.longitude}
          label="YOU"
        />
      </main>

      <footer className="dashboard-footer">
        <div className="footer-grid">
          <StatusIndicator
            label="TRACKING"
            status={trackingStatus}
            variant={statusVariant}
          />
          <StatusIndicator
            label="SOCKET"
            status={socketStatus}
            variant={socketStatus === 'LIVE' ? 'live' : 'disconnected'}
          />
        </div>
        <LocationInfo location={location} gpsStatus={gpsStatus} />
        {gpsStatus === 'LOCATION PERMISSION DENIED' && (
          <p className="help-text">
            Location permission is required to broadcast your position.
            Enable location access in your browser settings and reload.
          </p>
        )}
      </footer>
    </div>
  );
}
