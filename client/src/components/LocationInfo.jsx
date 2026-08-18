function formatRelativeTime(timestamp) {
  if (!timestamp) return '—';

  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hr ago`;
}

function formatCoord(value) {
  if (typeof value !== 'number') return '—';
  return value.toFixed(6);
}

export default function LocationInfo({ location, gpsStatus, showCoords = true }) {
  return (
    <div className="location-info">
      {showCoords && (
        <>
          <div className="info-row">
            <span className="info-key">LATITUDE</span>
            <span className="info-val">{formatCoord(location?.latitude)}</span>
          </div>
          <div className="info-row">
            <span className="info-key">LONGITUDE</span>
            <span className="info-val">{formatCoord(location?.longitude)}</span>
          </div>
        </>
      )}
      <div className="info-row">
        <span className="info-key">UPDATED</span>
        <span className="info-val">{formatRelativeTime(location?.timestamp)}</span>
      </div>
      {gpsStatus && (
        <div className="info-row">
          <span className="info-key">GPS STATUS</span>
          <span className="info-val accent">{gpsStatus}</span>
        </div>
      )}
    </div>
  );
}

export { formatRelativeTime, formatCoord };
