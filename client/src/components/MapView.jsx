import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import { avatarIcon } from './AvatarMarker';
import styles from './MapView.module.css';

/**
 * OpenStreetMap Tile Layer Configuration
 * 
 * OpenStreetMap (OSM) provides free map tiles organized by zoom level (z) and coordinates (x, y).
 * - {s}: Subdomains ('a', 'b', or 'c') to balance server load.
 * - {z}: Zoom level (0 to 19).
 * - {x}, {y}: Grid tile coordinates.
 */
const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

/**
 * MapRecenter Component
 * 
 * How it works:
 * React-Leaflet provides the `useMap()` hook to access the underlying Leaflet map instance.
 * Whenever `position` (latitude, longitude) changes, this component smoothly animates
 * the map camera to center on the user's latest location.
 */
function MapRecenter({ position }) {
  const map = useMap();
  const hasCenteredRef = useRef(false);

  useEffect(() => {
    if (!position || !position.latitude || !position.longitude) return;

    const { latitude, longitude } = position;

    // First time receiving location: perform a smooth zoom & fly-in
    if (!hasCenteredRef.current) {
      map.flyTo([latitude, longitude], 16, {
        animate: true,
        duration: 1.8,
      });
      hasCenteredRef.current = true;
    } else {
      // Subsequent live location updates: gently pan to follow movement
      map.panTo([latitude, longitude], {
        animate: true,
        duration: 0.8,
      });
    }
  }, [position, map]);

  return null;
}

/**
 * Main MapView Component
 * Renders the interactive OpenStreetMap using React-Leaflet.
 * 
 * @param {Object} props
 * @param {Object|null} props.position - Current GPS location { latitude, longitude, accuracy }
 */
export default function MapView({ position }) {
  // Default coordinates (global view) before GPS locks on
  const defaultCenter = [20.5937, 78.9629]; // Center of India / global fallback
  const defaultZoom = 4;

  const hasLocation = Boolean(position && position.latitude && position.longitude);

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className={styles.map}
        zoomControl={true}
        attributionControl={true}
      >
        {/* 1. OpenStreetMap Tile Layer */}
        <TileLayer
          url={OSM_TILE_URL}
          attribution={OSM_ATTRIBUTION}
          maxZoom={19}
        />

        {/* 2. Map Controller: Centers map whenever coordinates change */}
        {hasLocation && <MapRecenter position={position} />}

        {/* 3. Live Marker: Displays the custom avatar pin at the coordinates */}
        {hasLocation && (
          <Marker
            position={[position.latitude, position.longitude]}
            icon={avatarIcon}
          />
        )}

        {/* 4. Accuracy Circle: Displays GPS precision radius in meters */}
        {hasLocation && position.accuracy && (
          <Circle
            center={[position.latitude, position.longitude]}
            radius={position.accuracy}
            pathOptions={{
              color: 'rgba(100, 180, 255, 0.4)',
              fillColor: 'rgba(100, 180, 255, 0.08)',
              weight: 1.5,
            }}
          />
        )}
      </MapContainer>

      {/* Overlay indicator while waiting for GPS lock */}
      {!hasLocation && (
        <div className={styles.lockingOverlay}>Locking on GPS...</div>
      )}
    </div>
  );
}

