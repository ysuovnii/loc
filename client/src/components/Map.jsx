import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import PixelAvatarMarker from './PixelAvatarMarker';
import PixelZoomControl from './PixelZoomControl';
import 'leaflet/dist/leaflet.css';

const MAX_ZOOM = 19;

function MapRecenter({ latitude, longitude }) {
  const map = useMap();
  const hasRecentered = useRef(false);

  useEffect(() => {
    if (hasRecentered.current) return;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return;

    hasRecentered.current = true;
    map.setView([latitude, longitude], MAX_ZOOM, { animate: false });
  }, [latitude, longitude, map]);

  return null;
}

export default function MapView({ latitude, longitude, label = 'YOU', loadingText = 'WAITING FOR LOCATION', showOverlay, loadingFound = false }) {
  const hasLocation =
    typeof latitude === 'number' && typeof longitude === 'number';

  const defaultCenter = hasLocation ? [latitude, longitude] : [0, 0];
  const defaultZoom = hasLocation ? MAX_ZOOM : 2;

  const showLoader = showOverlay !== undefined ? showOverlay : !hasLocation;

  return (
    <div className="map-wrapper">
      <div className="map-pixel-frame" aria-hidden="true">
        <span className="map-corner map-corner--tl" />
        <span className="map-corner map-corner--tr" />
        <span className="map-corner map-corner--bl" />
        <span className="map-corner map-corner--br" />
      </div>

      {showLoader && (
        <div className="map-overlay">
          <div className="map-overlay-panel pixel-panel">
            <span className="map-loading-dots" aria-hidden="true">
              <span /><span /><span />
            </span>
            <span className={`map-overlay-text ${loadingFound ? 'map-overlay-text--found' : ''}`}>{loadingText}</span>
          </div>
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="map-container"
        zoomControl={false}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <PixelZoomControl />
        {hasLocation && (
          <>
            <MapRecenter latitude={latitude} longitude={longitude} />
            <PixelAvatarMarker
              latitude={latitude}
              longitude={longitude}
              label={label}
            />
          </>
        )}
      </MapContainer>

      <div className="map-scanlines" aria-hidden="true" />
    </div>
  );
}
