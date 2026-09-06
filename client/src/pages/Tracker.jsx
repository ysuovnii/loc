import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import ProfileCard from '../components/ProfileCard';
import ViewerBanner from '../components/ViewerBanner';
import { useSocket } from '../hooks/useSocket';
import { useGeolocation } from '../hooks/useGeolocation';
import styles from './Tracker.module.css';

const STALE_LIMIT_MS = 20 * 1000; // consider the link stale only after this much silence

export default function Tracker() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [accessCode, setAccessCode] = useState(null);
  const [broadcasterPosition, setBroadcasterPosition] = useState(null);
  const [viewerPosition, setViewerPosition] = useState(null);

  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [inspectedPoint, setInspectedPoint] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const [broadcasting, setBroadcasting] = useState(true);

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

  useEffect(() => {
    if (!accessCode) return;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${apiUrl}/api/history?accessCode=${encodeURIComponent(accessCode)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.history)) {
          setHistory(data.history);
        }
      })
      .catch((err) => {
        console.warn('[History] Fetch error:', err.message);
      });
  }, [accessCode]);

  const handleBroadcasterLocation = useCallback(
    (coords) => {
      setBroadcasterPosition({ ...coords, updatedAt: new Date() });
      const socket = socketRef.current;
      if (socket && socket.connected) {
        socket.emit('location:update', coords);
      }
    },
    [socketRef]
  );

  const {
    stop: stopTracking,
  } = useGeolocation(
    isBroadcaster ? handleBroadcasterLocation : null,
    isBroadcaster && broadcasting
  );

  const handleToggleBroadcast = useCallback(() => {
    if (broadcasting) {
      stopTracking();
      setBroadcasting(false);
    } else {
      setBroadcasting(true);
    }
  }, [broadcasting, stopTracking]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    function onLocationUpdate(data) {
      setViewerPosition({
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        updatedAt: data.updatedAt || new Date(),
      });
    }

    function onHistoryPoint(point) {
      setHistory((prev) => {
        if (prev.some((p) => p._id === point._id)) return prev;
        return [...prev, point];
      });
    }

    socket.on('location:update', onLocationUpdate);
    socket.on('location:history-point', onHistoryPoint);

    return () => {
      socket.off('location:update', onLocationUpdate);
      socket.off('location:history-point', onHistoryPoint);
    };
  }, [accessCode, socketRef]);

  const displayPosition = isBroadcaster ? broadcasterPosition : viewerPosition;

  const hasTargetPosition = Boolean(
    displayPosition && displayPosition.latitude && displayPosition.longitude
  );

  // Data-first status: fresh location data means the link is active, even if the
  // socket briefly reconnects. Only report OFFLINE when nothing is flowing.
  const lastUpdatedMs = displayPosition?.updatedAt
    ? new Date(displayPosition.updatedAt).getTime()
    : null;
  const isFresh =
    hasTargetPosition &&
    (lastUpdatedMs === null || Date.now() - lastUpdatedMs < STALE_LIMIT_MS);

  let linkStatus;
  if (isBroadcaster && !broadcasting) {
    linkStatus = 'paused';
  } else if (isFresh) {
    linkStatus = 'active';
  } else if (socketStatus === 'online' || socketStatus === 'connecting') {
    linkStatus = 'unavailable';
  } else {
    linkStatus = 'offline';
  }

  return (
    <div className={styles.page}>
      <ViewerBanner status={linkStatus} />

      <MapView
        role={role}
        position={inspectedPoint || displayPosition}
        history={history}
        showHistory={showHistory}
        onSelectHistoricalPoint={(pt) => setInspectedPoint(pt)}
        onToggleLocationInfo={() => setShowInfo((prev) => !prev)}
      />

      {showInfo && (
        <ProfileCard
          role={role}
          status={linkStatus}
          position={displayPosition}
          history={history}
          showHistory={showHistory}
          onToggleHistory={() => setShowHistory((prev) => !prev)}
          inspectedPoint={inspectedPoint}
          onSelectHistoricalPoint={(pt) => setInspectedPoint(pt)}
          onResetToLive={() => setInspectedPoint(null)}
          broadcasting={broadcasting}
          onToggleBroadcast={handleToggleBroadcast}
        />
      )}
    </div>
  );
}