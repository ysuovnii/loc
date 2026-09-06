import { useEffect, useRef, useMemo } from 'react';
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
  createAvatarIcon,
  createWaypointIcon,
} from './AvatarMarker';
import { formatTime, formatTimeAgo } from '../services/geoUtils';
import styles from './MapView.module.css';

const TILE_URL =
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

function CameraController({ position, history, showHistory, followRef }) {
  const map = useMap();
  const hasCenteredRef = useRef(false);
  const prevShowHistoryRef = useRef(false);

  useEffect(() => {
    if (!position?.latitude || !position?.longitude) return;
    if (!hasCenteredRef.current) {
      map.flyTo([position.latitude, position.longitude], 16, {
        animate: true,
        duration: 1.4,
      });
      hasCenteredRef.current = true;
    }
  }, [position, map]);

  // Any direct user interaction on the map stops the auto-follow.
  useEffect(() => {
    const container = map.getContainer();
    const markUser = () => {
      followRef.current = false;
    };
    map.on('dragstart', markUser);
    container.addEventListener('mousedown', markUser);
    container.addEventListener('touchstart', markUser);
    container.addEventListener('wheel', markUser);
    return () => {
      map.off('dragstart', markUser);
      container.removeEventListener('mousedown', markUser);
      container.removeEventListener('touchstart', markUser);
      container.removeEventListener('wheel', markUser);
    };
  }, [map, followRef]);

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
        map.flyToBounds(L.latLngBounds(allPoints), {
          padding: [70, 70],
          duration: 1,
          maxZoom: 16,
        });
      } else if (allPoints.length === 1) {
        map.flyTo(allPoints[0], 15, { duration: 1 });
      }
    }
    prevShowHistoryRef.current = showHistory;
  }, [showHistory, history, position, map]);

  useEffect(() => {
    if (!hasCenteredRef.current) return;
    if (!followRef.current) return;
    if (showHistory) return;
    if (position?.latitude && position?.longitude) {
      map.panTo([position.latitude, position.longitude], {
        animate: true,
        duration: 0.5,
      });
    }
  }, [position, showHistory, map, followRef]);

  return null;
}

function MapRegistrar({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

export default function MapView({
  role,
  position,
  history = [],
  showHistory = false,
  onSelectHistoricalPoint,
  onToggleLocationInfo,
}) {
  const mapRef = useRef(null);
  const followRef = useRef(true);
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 4;

  const hasLocation = Boolean(position && position.latitude && position.longitude);

  const targetIcon = useMemo(
    () => createAvatarIcon(role === 'broadcaster' ? 'YOU' : 'DOODHVAALA'),
    [role]
  );

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

  // Compute per-point brightness for the history trail. Older points fade to a
  // dull blue; newer points are brighter, with the current location brightest.
  const historyPoints = [];
  if (showHistory) {
    const timestamps = [];
    history.forEach((pt) => {
      if (pt.latitude && pt.longitude && pt.timestamp) timestamps.push(new Date(pt.timestamp).getTime());
    });
    const maxTs = Math.max(...timestamps, -Infinity);
    const minTs = Math.min(...timestamps, Infinity);
    const span = maxTs - minTs || 1;
    history.forEach((pt) => {
      if (pt.latitude && pt.longitude) {
        let opacity = 0.3;
        if (pt.timestamp) {
          const ts = new Date(pt.timestamp).getTime();
          opacity = 0.3 + 0.6 * ((ts - minTs) / span);
        }
        historyPoints.push({ pt, opacity });
      }
    });
  }

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className={styles.map}
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={19} />

        <MapRegistrar mapRef={mapRef} />
        <CameraController
          position={position}
          history={history}
          showHistory={showHistory}
          followRef={followRef}
        />

        {showHistory && polylineCoords.length >= 2 && (
          <>
            {polylineCoords.slice(0, -1).map((start, i) => {
              const end = polylineCoords[i + 1];
              if (!end) return null;
              const progress = i / (polylineCoords.length - 1);
              const opacity = 0.15 + 0.85 * progress;
              return (
                <Polyline
                  key={`seg-${i}`}
                  positions={[start, end]}
                  pathOptions={{
                    color: '#38bdf8',
                    weight: 3.5,
                    opacity,
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
              );
            })}
          </>
        )}

        {showHistory &&
          historyPoints.map(({ pt, opacity }, idx) => (
            <Marker
              key={pt._id || idx}
              position={[pt.latitude, pt.longitude]}
              icon={createWaypointIcon(opacity)}
              eventHandlers={{
                click: () => onSelectHistoricalPoint && onSelectHistoricalPoint(pt),
              }}
            >
              <Popup>
                <div className={styles.popupTitle}>History point #{idx + 1}</div>
                <div className={styles.popupSub}>
                  {formatTime(pt.timestamp)} ({formatTimeAgo(pt.timestamp)})
                </div>
              </Popup>
            </Marker>
          ))}

        {hasLocation && (
          <Marker
            position={[position.latitude, position.longitude]}
            icon={targetIcon}
            eventHandlers={{
              click: (e) => {
                if (onToggleLocationInfo) onToggleLocationInfo();
                L.DomEvent.stopPropagation(e);
              },
            }}
          >
            <Popup>
              <div className={styles.popupTitle}>Current location</div>
              <div className={styles.popupSub}>
                {position.updatedAt ? formatTimeAgo(position.updatedAt) : 'Live'}
              </div>
            </Popup>
          </Marker>
        )}

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
      </MapContainer>

      {!hasLocation && (
        <div className={styles.lockingOverlay}>SEARCHING FOR LOCATION...</div>
      )}
    </div>
  );
}