import { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Polyline,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import {
  dropPinIcon,
  userLocationIcon,
  startPointIcon,
  waypointIcon,
} from './AvatarMarker';
import { formatTime, formatTimeAgo } from '../services/geoUtils';
import styles from './MapView.module.css';

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

/**
 * Controller responsible for smooth camera animations (zoom & fly)
 */
function CameraController({
  position,
  history,
  showHistory,
  viewerLocation,
  activeFocus,
}) {
  const map = useMap();
  const hasCenteredRef = useRef(false);
  const prevShowHistoryRef = useRef(showHistory);
  const prevFocusRef = useRef(activeFocus);

  // Initial fly-in when first GPS coordinates are acquired
  useEffect(() => {
    if (!position?.latitude || !position?.longitude) return;

    if (!hasCenteredRef.current) {
      map.flyTo([position.latitude, position.longitude], 16, {
        animate: true,
        duration: 1.8,
      });
      hasCenteredRef.current = true;
    }
  }, [position, map]);

  // Zoom animate to full history bounds when history is turned on
  useEffect(() => {
    if (showHistory && !prevShowHistoryRef.current) {
      const allPoints = [];
      if (history && history.length > 0) {
        history.forEach((p) => {
          if (p.latitude && p.longitude) {
            allPoints.push([p.latitude, p.longitude]);
          }
        });
      }
      if (position?.latitude && position?.longitude) {
        allPoints.push([position.latitude, position.longitude]);
      }

      if (allPoints.length >= 2) {
        const bounds = L.latLngBounds(allPoints);
        map.flyToBounds(bounds, {
          padding: [70, 70],
          duration: 1.5,
          maxZoom: 17,
        });
      } else if (allPoints.length === 1) {
        map.flyTo(allPoints[0], 16, { duration: 1.2 });
      }
    }
    prevShowHistoryRef.current = showHistory;
  }, [showHistory, history, position, map]);

  // Camera animations when active focus changes ('viewer', 'target', etc.)
  useEffect(() => {
    if (activeFocus === 'viewer' && viewerLocation?.latitude && viewerLocation?.longitude) {
      map.flyTo([viewerLocation.latitude, viewerLocation.longitude], 16, {
        animate: true,
        duration: 1.2,
      });
    } else if (activeFocus === 'target' && position?.latitude && position?.longitude) {
      map.flyTo([position.latitude, position.longitude], 16, {
        animate: true,
        duration: 1.2,
      });
    }
    prevFocusRef.current = activeFocus;
  }, [activeFocus, viewerLocation, position, map]);

  // Subsequent gentle pans to follow live position updates
  useEffect(() => {
    if (!hasCenteredRef.current) return;
    if (activeFocus === 'target' && !showHistory && position?.latitude && position?.longitude) {
      map.panTo([position.latitude, position.longitude], {
        animate: true,
        duration: 0.8,
      });
    }
  }, [position, activeFocus, showHistory, map]);

  return null;
}

export default function MapView({
  position,
  history = [],
  showHistory = false,
  viewerLocation = null,
  activeFocus = 'target',
  onToggleMyLocation,
  onRecenterTarget,
  onSelectHistoricalPoint,
}) {
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 4;

  const hasLocation = Boolean(position && position.latitude && position.longitude);

  // Assemble full history coordinates including latest live position
  const polylineCoords = [];
  if (showHistory && history.length > 0) {
    history.forEach((pt) => {
      if (pt.latitude && pt.longitude) {
        polylineCoords.push([pt.latitude, pt.longitude]);
      }
    });
    if (hasLocation) {
      polylineCoords.push([position.latitude, position.longitude]);
    }
  }

  const startPoint = history.length > 0 ? history[0] : null;

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className={styles.map}
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} maxZoom={19} />

        <CameraController
          position={position}
          history={history}
          showHistory={showHistory}
          viewerLocation={viewerLocation}
          activeFocus={activeFocus}
        />

        {/* 24-Hour Location History Polyline Trail */}
        {showHistory && polylineCoords.length >= 2 && (
          <>
            {/* Outer neon glow */}
            <Polyline
              positions={polylineCoords}
              pathOptions={{
                color: 'rgba(56, 189, 248, 0.25)',
                weight: 9,
                opacity: 0.6,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Core crisp polyline */}
            <Polyline
              positions={polylineCoords}
              pathOptions={{
                color: '#38bdf8',
                weight: 3.5,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}

        {/* Start Point Marker */}
        {showHistory && startPoint && startPoint.latitude && (
          <Marker
            position={[startPoint.latitude, startPoint.longitude]}
            icon={startPointIcon}
          >
            <Popup>
              <div className={styles.popupTitle}>Route Origin</div>
              <div className={styles.popupSub}>
                {formatTime(startPoint.timestamp)} ({formatTimeAgo(startPoint.timestamp)})
              </div>
            </Popup>
          </Marker>
        )}

        {/* History Waypoint Dots */}
        {showHistory &&
          history.map((pt, idx) => (
            <Marker
              key={pt._id || idx}
              position={[pt.latitude, pt.longitude]}
              icon={waypointIcon}
              eventHandlers={{
                click: () => onSelectHistoricalPoint && onSelectHistoricalPoint(pt),
              }}
            >
              <Popup>
                <div className={styles.popupTitle}>History Breadcrumb #{idx + 1}</div>
                <div className={styles.popupSub}>
                  Time: {formatTime(pt.timestamp)} ({formatTimeAgo(pt.timestamp)})
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Tracked User Drop Pin Marker */}
        {hasLocation && (
          <Marker
            position={[position.latitude, position.longitude]}
            icon={dropPinIcon}
          >
            <Popup>
              <div className={styles.popupTitle}>Current Location</div>
              <div className={styles.popupSub}>
                {position.updatedAt ? formatTimeAgo(position.updatedAt) : 'Live'}
              </div>
            </Popup>
          </Marker>
        )}

        {/* GPS Accuracy Circle */}
        {hasLocation && position.accuracy && (
          <Circle
            center={[position.latitude, position.longitude]}
            radius={position.accuracy}
            pathOptions={{
              color: 'rgba(249, 59, 79, 0.4)',
              fillColor: 'rgba(249, 59, 79, 0.08)',
              weight: 1.5,
            }}
          />
        )}

        {/* Viewer's Own Location Marker ("Show My Location") */}
        {viewerLocation && viewerLocation.latitude && viewerLocation.longitude && (
          <Marker
            position={[viewerLocation.latitude, viewerLocation.longitude]}
            icon={userLocationIcon}
          >
            <Popup>
              <div className={styles.popupTitle}>Your Location</div>
              <div className={styles.popupSub}>You are here</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Action Buttons */}
      <div className={styles.controlsPanel}>
        <button
          className={`${styles.controlBtn} ${activeFocus === 'viewer' ? styles.active : ''}`}
          onClick={onToggleMyLocation}
          title="Show My Location"
        >
          <span className={styles.icon}>🎯</span>
          <span>{viewerLocation ? 'My Location' : 'Show My Location'}</span>
        </button>

        {hasLocation && (
          <button
            className={`${styles.controlBtn} ${activeFocus === 'target' ? styles.active : ''}`}
            onClick={onRecenterTarget}
            title="Recenter Tracked User"
          >
            <span className={styles.icon}>📍</span>
            <span>Focus Tracked Pin</span>
          </button>
        )}
      </div>

      {/* Locking overlay while waiting for initial coordinates */}
      {!hasLocation && (
        <div className={styles.lockingOverlay}>Locking on GPS...</div>
      )}
    </div>
  );
}
