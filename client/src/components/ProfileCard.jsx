import { useState, useEffect } from 'react';
import { reverseGeocode } from '../services/geocode';
import {
  calculateTotalDistance,
  formatDistance,
  formatTime,
  formatTimeAgo,
} from '../services/geoUtils';
import styles from './ProfileCard.module.css';

export default function ProfileCard({
  role,
  connectionStatus,
  position,
  history = [],
  showHistory = false,
  onToggleHistory,
  inspectedPoint = null,
  onSelectHistoricalPoint,
  onResetToLive,
}) {
  const [locationName, setLocationName] = useState('Locating...');

  const displayName = role === 'broadcaster' ? 'YOU' : 'DOODHVAALA';
  const roleLabel = role === 'broadcaster' ? 'BROADCASTER' : 'VIEWER';

  const statusLabel =
    connectionStatus === 'online'
      ? 'ONLINE'
      : connectionStatus === 'connecting'
      ? 'CONNECTING'
      : 'OFFLINE';

  const dotClass =
    connectionStatus === 'online'
      ? styles.dotOnline
      : connectionStatus === 'connecting'
      ? styles.dotConnecting
      : styles.dotOffline;

  // Active position to display (inspected historical point or live position)
  const activePosition = inspectedPoint || position;

  useEffect(() => {
    if (!activePosition) {
      setLocationName('Locating...');
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

  // Compute 24-hour total distance traveled
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

  return (
    <div className={styles.card}>
      <div className={styles.name}>
        <span>{displayName}</span>
        <span className={styles.roleTag}>{roleLabel}</span>
      </div>

      <div className={styles.statusRow}>
        <div className={`${styles.dot} ${dotClass}`} />
        <span className={styles.statusText}>{statusLabel}</span>
      </div>

      <div className={styles.sectionLabel}>
        {inspectedPoint ? 'INSPECTED LOCATION' : 'CURRENT LOCATION'}
      </div>
      <div className={styles.sectionValue}>{locationName}</div>

      <div className={styles.divider} />

      {/* Toggle 24-Hour Location History */}
      <button
        className={`${styles.historyBtn} ${showHistory ? styles.historyBtnActive : ''}`}
        onClick={onToggleHistory}
      >
        <div className={styles.historyBtnLabel}>
          <span>LOCATION HISTORY</span>
          {showHistory && <span className={styles.historyBadge}>ON</span>}
        </div>
        <span className={styles.arrow}>{showHistory ? '▼' : '→'}</span>
      </button>

      {/* History Details and Scrubber */}
      {showHistory && (
        <div className={styles.historyDetails}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>24H Traveled</div>
              <div className={styles.statValue}>
                {formatDistance(totalDistanceMeters)}
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Waypoints</div>
              <div className={styles.statValue}>
                {allPoints.length} points
              </div>
            </div>
          </div>

          {/* Timeline Scrubber to change the current inspected time/location */}
          {allPoints.length > 1 && (
            <div className={styles.scrubberContainer}>
              <div className={styles.scrubberHeader}>
                <span className={styles.scrubberLabel}>Time Scrubber</span>
                <span className={styles.scrubberTime}>
                  {inspectedPoint
                    ? formatTime(inspectedPoint.timestamp)
                    : 'Live (Latest)'}
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
            </div>
          )}

          {inspectedPoint && (
            <div className={styles.inspectNotice}>
              <span>Viewing past timestamp</span>
              <button className={styles.resetBtn} onClick={onResetToLive}>
                Back to Live
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
