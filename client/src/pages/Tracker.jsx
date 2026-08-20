import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import ProfileCard from '../components/ProfileCard';
import { useSocket } from '../hooks/useSocket';
import { useGeolocation } from '../hooks/useGeolocation';
import styles from './Tracker.module.css';

export default function Tracker() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [accessCode, setAccessCode] = useState(null);
  const [broadcasterPosition, setBroadcasterPosition] = useState(null);
  const [viewerPosition, setViewerPosition] = useState(null);

  useEffect(() => {
    const storedCode = sessionStorage.getItem('accessCode');
    const storedRole = sessionStorage.getItem('role');
    if (!storedCode || !storedRole) {
      navigate('/');
      return;
    }
    setAccessCode(storedCode);
    setRole(storedRole);
  }, [navigate]);

  const isBroadcaster = role === 'broadcaster';

  const { status: socketStatus, socketRef } = useSocket(accessCode);

  const handleBroadcasterLocation = useCallback((coords) => {
    setBroadcasterPosition(coords);
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit('location:update', coords);
    }
  }, [socketRef]);

  const { status: gpsStatus } = useGeolocation(
    isBroadcaster ? handleBroadcasterLocation : null,
    isBroadcaster
  );

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    function onLocationUpdate(data) {
      console.log('[Socket] location:update received');
      setViewerPosition({
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
      });
    }

    socket.on('location:update', onLocationUpdate);
    return () => socket.off('location:update', onLocationUpdate);
  }, [accessCode, socketRef]);

  const displayPosition = isBroadcaster ? broadcasterPosition : viewerPosition;

  return (
    <div className={styles.page}>
      <MapView position={displayPosition} />
      <ProfileCard
        role={role}
        connectionStatus={socketStatus}
        position={displayPosition}
      />
    </div>
  );
}
