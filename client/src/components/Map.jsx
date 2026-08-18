import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const pixelIcon = new L.DivIcon({
  className: 'pixel-marker',
  html: '<div class="pixel-marker-inner"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

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
      {!hasLocation && (
        <div className="map-overlay">
          <span className="map-overlay-text">WAITING FOR LOCATION</span>
        </div>
      )}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="map-container"
        zoomControl
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {hasLocation && (
          <>
            <MapRecenter latitude={latitude} longitude={longitude} />
            <Marker position={[latitude, longitude]} icon={pixelIcon}>
              <Tooltip permanent direction="top" offset={[0, -12]} className="pixel-tooltip">
                {label}
              </Tooltip>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
}
