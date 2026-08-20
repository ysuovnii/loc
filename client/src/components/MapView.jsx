import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { avatarIcon } from './AvatarMarker';
import styles from './MapView.module.css';

function AnimatedMarker({ position }) {
  const markerRef = useRef(null);
  const map = useMap();
  const [initialLock, setInitialLock] = useState(true);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!position || !markerRef.current) return;

    if (initialLock) {
      map.flyTo([position.latitude, position.longitude], 16, {
        duration: 1.8,
        easeLinearity: 0.25,
      });
      setInitialLock(false);
    }
  }, [position, map, initialLock]);

  useEffect(() => {
    if (!position || !markerRef.current) return;

    const marker = markerRef.current;
    const target = L.latLng(position.latitude, position.longitude);
    const current = marker.getLatLng();

    if (Math.abs(current.lat - target.lat) < 0.00001 && Math.abs(current.lng - target.lng) < 0.00001) {
      return;
    }

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const duration = 800;
    const startTime = Date.now();
    const startLat = current.lat;
    const startLng = current.lng;
    const dLat = target.lat - startLat;
    const dLng = target.lng - startLng;

    let frame;
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      marker.setLatLng([
        startLat + dLat * ease,
        startLng + dLng * ease,
      ]);

      if (t < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    animFrameRef.current = frame;

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [position]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  if (!position) return null;

  return (
    <>
      <Marker
        ref={markerRef}
        position={[position.latitude, position.longitude]}
        icon={avatarIcon}
      />
      {position.accuracy && (
        <Circle
          center={[position.latitude, position.longitude]}
          radius={position.accuracy}
          pathOptions={{
            color: 'rgba(100, 180, 255, 0.15)',
            fillColor: 'rgba(100, 180, 255, 0.03)',
            weight: 1,
          }}
        />
      )}
    </>
  );
}

export default function MapView({ position }) {
  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={[20, 0]}
        zoom={3}
        className={styles.map}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />
        <AnimatedMarker position={position} />
      </MapContainer>
      {!position && <div className={styles.lockingOverlay}>Locking on</div>}
    </div>
  );
}
