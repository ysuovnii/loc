import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import ProfileCard from '../components/ProfileCard';
import ViewerBanner from '../components/ViewerBanner';
import { useSocket } from '../hooks/useSocket';
import { useGeolocation } from '../hooks/useGeolocation';
import { calculateDistanceMeters, formatDistance } from '../services/geoUtils';
import styles from './Tracker.module.css';

export default function Tracker() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [accessCode, setAccessCode] = useState(null);
  const [broadcasterPosition, setBroadcasterPosition] = useState(null);
  const [viewerPosition, setViewerPosition] = useState(null);

  // 24-Hour Location History State
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [inspectedPoint, setInspectedPoint] = useState(null);

  // Viewer's own location & camera focus state
  const [viewerLocation, setViewerLocation] = useState(null);
  const [activeFocus, setActiveFocus] = useState('target'); // 'target' | 'viewer'

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

  // Fetch initial 24-hour location history from server
  useEffect(() => {
    if (!accessCode) return;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${apiUrl}/api/access/history?accessCode=${encodeURIComponent(accessCode)}`)
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

  // Broadcaster emits live GPS location
  const handleBroadcasterLocation = useCallback(
    (coords) => {
      setBroadcasterPosition(coords);
      const socket = socketRef.current;
      if (socket && socket.connected) {
        socket.emit('location:update', coords);
      }
    },
    [socketRef]
  );

  const { status: gpsStatus } = useGeolocation(
    isBroadcaster ? handleBroadcasterLocation : null,
    isBroadcaster
  );

  // Socket listeners for real-time location updates & history breadcrumbs
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
        // Prevent duplicate IDs
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

  // Toggle or acquire viewer's own location ("Show My Location")
  const handleToggleMyLocation = useCallback(() => {
    if (activeFocus === 'viewer') {
      setActiveFocus('target');
      return;
    }

    if (viewerLocation) {
      setActiveFocus('viewer');
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setViewerLocation(coords);
        setActiveFocus('viewer');
      },
      (err) => {
        console.warn('[Viewer Geolocation] Error:', err.message);
        alert('Could not acquire your current location. Please grant location permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [activeFocus, viewerLocation]);

  // Calculate distance between viewer and tracked user
  let distanceBetweenFormatted = null;
  if (viewerLocation && displayPosition?.latitude && displayPosition?.longitude) {
    const distMeters = calculateDistanceMeters(
      viewerLocation.latitude,
      viewerLocation.longitude,
      displayPosition.latitude,
      displayPosition.longitude
    );
    distanceBetweenFormatted = formatDistance(distMeters);
  }

  return (
    <div className={styles.page}>
      {/* Top Status Banner */}
      <ViewerBanner
        role={role}
        distanceBetween={distanceBetweenFormatted}
        connectionStatus={socketStatus}
      />

      {/* Main Leaflet Map View */}
      <MapView
        position={inspectedPoint || displayPosition}
        history={history}
        showHistory={showHistory}
        viewerLocation={viewerLocation}
        activeFocus={activeFocus}
        onToggleMyLocation={handleToggleMyLocation}
        onRecenterTarget={() => setActiveFocus('target')}
        onSelectHistoricalPoint={(pt) => setInspectedPoint(pt)}
      />

      {/* Bottom Floating Profile Card */}
      <ProfileCard
        role={role}
        connectionStatus={socketStatus}
        position={displayPosition}
        history={history}
        showHistory={showHistory}
        onToggleHistory={() => setShowHistory((prev) => !prev)}
        inspectedPoint={inspectedPoint}
        onSelectHistoricalPoint={(pt) => setInspectedPoint(pt)}
        onResetToLive={() => setInspectedPoint(null)}
      />
    </div>
  );
}
