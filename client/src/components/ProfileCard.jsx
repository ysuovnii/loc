import { useEffect, useState } from 'react';
import { loadPixelAvatar } from '../utils/pixelateImage';

function formatRelativeTime(timestamp) {
  if (!timestamp) return '\u2014';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function ProfileCard({ location, locationName }) {
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    loadPixelAvatar().then(setAvatar).catch(() => {});
  }, []);

  return (
    <div className="profile-card">
      <div className="profile-card-header">
        {avatar && (
          <img
            className="profile-card-avatar"
            src={avatar}
            alt="doodhvaala"
            draggable="false"
          />
        )}
        <div className="profile-card-info">
          <span className="profile-card-name">doodhvaala</span>
          <span
            className={`profile-card-location ${
              locationName ? '' : 'profile-card-location--loading'
            }`}
          >
            {locationName || 'Locating\u2026'}
          </span>
        </div>
      </div>

      <div className="profile-card-divider" />

      <span className="profile-card-section-label">Location History</span>

      <div className="profile-card-history">
        <span className="profile-card-history-empty">
          Coming soon
        </span>
      </div>
    </div>
  );
}
