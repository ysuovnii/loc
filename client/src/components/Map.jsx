import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import PixelAvatarMarker from './PixelAvatarMarker';
import PixelZoomControl from './PixelZoomControl';
import 'leaflet/dist/leaflet.css';

function MapRecenter({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      map.setView([latitude, longitude], map.getZoom(), { animate: true });
    }
  }, [latitude, longitude, map]);

  return null;
}

export default function MapView({ latitude, longitude, label = 'YOU' }) {
  const hasLocation =
    typeof latitude === 'number' && typeof longitude === 'number';

  const defaultCenter = hasLocation ? [latitude, longitude] : [20, 0];
  const defaultZoom = hasLocation ? 15 : 2;

  return (
    <div className="map-wrapper">
      <div className="map-pixel-frame" aria-hidden="true">
        <span className="map-corner map-corner--tl" />
        <span className="map-corner map-corner--tr" />
        <span className="map-corner map-corner--bl" />
        <span className="map-corner map-corner--br" />
      </div>

      {!hasLocation && (
        <div className="map-overlay">
          <div className="map-overlay-panel pixel-panel">
            <span className="map-loading-dots" aria-hidden="true">
              <span /><span /><span />
            </span>
            <span className="map-overlay-text">WAITING FOR LOCATION</span>
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
