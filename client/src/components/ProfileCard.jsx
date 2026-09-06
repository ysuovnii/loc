import { useState, useEffect } from 'react';
import { reverseGeocode } from '../services/geocode';
import {
  calculateTotalDistance,
  formatDistance,
  formatTime,
  formatTimeAgo,
} from '../services/geoUtils';
import { statusMeta } from '../services/status';
import styles from './ProfileCard.module.css';

export default function ProfileCard({
  role,
  status,
  position,
  history = [],
  showHistory = false,
  onToggleHistory,
  inspectedPoint = null,
  onSelectHistoricalPoint,
  onResetToLive,
  broadcasting = true,
  onToggleBroadcast,
}) {
  const isBroadcaster = role === 'broadcaster';
  const meta = statusMeta(status);
  const [locationName, setLocationName] = useState('');
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const activePosition = inspectedPoint || position;

  useEffect(() => {
    if (!activePosition) {
      setLocationName('');
      return;
    }

    let cancelled = false;
    reverseGeocode(activePosition.latitude, activePosition.longitude).then((name) => {
      if (!cancelled) setLocationName(name);
    });

    return () => {
      cancelled = true;
    };
  }, [activePosition]);

  const totalDistanceMeters = calculateTotalDistance([
    ...history,
    ...(position ? [position] : []),
  ]);

  const allPoints = [...history, ...(position ? [position] : [])];
  const scrubberMax = Math.max(0, allPoints.length - 1);

  const handleSliderChange = (e) => {
    const idx = parseInt(e.target.value, 10);
    if (idx === scrubberMax) {
      if (onResetToLive) onResetToLive();
    } else {
      const selected = allPoints[idx];
      if (onSelectHistoricalPoint) onSelectHistoricalPoint(selected);
    }
  };

  const currentSliderIndex = inspectedPoint
    ? allPoints.findIndex(
        (p) =>
          p.latitude === inspectedPoint.latitude &&
          p.longitude === inspectedPoint.longitude &&
          p.timestamp === inspectedPoint.timestamp
      )
    : scrubberMax;

  const lastUpdated = position?.updatedAt ? formatTimeAgo(position.updatedAt) : '—';
  const accuracy =
    position && position.accuracy != null ? `\u00B1${formatDistance(position.accuracy)}` : '—';

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>
          {isBroadcaster ? 'BROADCAST' : 'TRACKING'}
        </span>
        <span className={styles.status}>
          <span className={`${styles.dot} ${styles[meta.tone]}`} />
          <span className={styles.statusText}>{meta.label}</span>
        </span>
      </div>

      <div className={styles.rows}>
        {isBroadcaster ? (
          <div className={styles.row}>
            <span className={styles.rowLabel}>LOCATION</span>
            <span className={styles.rowValue}>{broadcasting ? 'LIVE' : 'PAUSED'}</span>
          </div>
        ) : (
          <div className={styles.row}>
            <span className={styles.rowLabel}>TARGET</span>
            <span className={styles.rowValue}>DOODHVAALA</span>
          </div>
        )}

        <div className={styles.row}>
          <span className={styles.rowLabel}>UPDATED</span>
          <span className={styles.rowValue}>{lastUpdated}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.rowLabel}>ACCURACY</span>
          <span className={styles.rowValue}>{accuracy}</span>
        </div>

        {locationName && (
          <div className={styles.row}>
            <span className={styles.rowLabel}>AREA</span>
            <span className={styles.rowValue}>{locationName}</span>
          </div>
        )}
      </div>

      {showHistory && allPoints.length > 1 && (
        <div className={styles.history}>
          <div className={styles.historyHeader}>
            <span className={styles.rowLabel}>PATH</span>
            <span className={styles.rowValue}>
              {formatDistance(totalDistanceMeters)} &middot; {allPoints.length} pts
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={scrubberMax}
            value={currentSliderIndex >= 0 ? currentSliderIndex : scrubberMax}
            onChange={handleSliderChange}
            className={styles.slider}
          />
          <div className={styles.historyFooter}>
            <span className={styles.historyTime}>
              {inspectedPoint ? formatTime(inspectedPoint.timestamp) : 'LIVE'}
            </span>
            {inspectedPoint && (
              <button className={styles.linkBtn} onClick={onResetToLive}>
                BACK TO LIVE
              </button>
            )}
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button
          className={`${styles.toggleBtn} ${showHistory ? styles.toggleBtnActive : ''}`}
          onClick={onToggleHistory}
        >
          {showHistory ? 'HIDE HISTORY' : 'HISTORY'}
        </button>

        {isBroadcaster && (
          <button
            className={`${styles.toggleBtn} ${broadcasting ? styles.stopBtn : styles.startBtn}`}
            onClick={onToggleBroadcast}
          >
            {broadcasting ? 'STOP BROADCAST' : 'RESTART BROADCAST'}
          </button>
        )}
      </div>
    </div>
  );
}