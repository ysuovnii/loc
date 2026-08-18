import { useEffect, useRef, useState } from 'react';
import MapView from '../components/Map';
import StatusIndicator from '../components/StatusIndicator';
import LocationInfo, { formatRelativeTime } from '../components/LocationInfo';
import { createSocket } from '../services/socket';

export default function ViewerPage({ accessCode }) {
  const socketRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [socketStatus, setSocketStatus] = useState('CONNECTING');
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const socket = createSocket(accessCode);
    socketRef.current = socket;

    const onConnect = () => setSocketStatus('LIVE');
    const onDisconnect = () => setSocketStatus('DISCONNECTED');
    const onLocationUpdate = (data) => {
      setLocation({
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp ?? Date.now(),
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', () => setSocketStatus('DISCONNECTED'));
    socket.on('location:update', onLocationUpdate);

    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('location:update', onLocationUpdate);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessCode]);

  const broadcasterStatus =
    socketStatus === 'DISCONNECTED'
      ? 'DISCONNECTED'
      : location
        ? 'LIVE'
        : 'WAITING FOR LOCATION';

  const statusVariant =
    broadcasterStatus === 'LIVE'
      ? 'live'
      : broadcasterStatus === 'DISCONNECTED'
        ? 'disconnected'
        : 'waiting';

  return (
    <div className="page dashboard-page viewer-page">
      <header className="dashboard-header">
        <h1 className="dashboard-title">LOCATION TRACKER</h1>
        <StatusIndicator
          status={broadcasterStatus === 'LIVE' ? 'LIVE' : broadcasterStatus}
          variant={statusVariant}
        />
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
            label="BROADCASTER"
            status={broadcasterStatus}
            variant={statusVariant}
          />
          <StatusIndicator
            label="SOCKET"
            status={socketStatus}
            variant={socketStatus === 'LIVE' ? 'live' : 'disconnected'}
          />
        </div>
        <div className="info-row">
          <span className="info-key">LAST UPDATE</span>
          <span className="info-val">{formatRelativeTime(location?.timestamp)}</span>
        </div>
        {location && (
          <LocationInfo location={location} showCoords={false} />
        )}
        {!location && socketStatus === 'LIVE' && (
          <p className="help-text">
            Connected. Waiting for the broadcaster to share their location.
          </p>
        )}
      </footer>
    </div>
  );
}
