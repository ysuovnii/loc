import { useState, useEffect } from 'react';
import { reverseGeocode } from '../services/geocode';
import styles from './ProfileCard.module.css';

export default function ProfileCard({ role, connectionStatus, position }) {
  const [historyClicked, setHistoryClicked] = useState(false);
  const [locationName, setLocationName] = useState('Locating...');

  const displayName = role === 'broadcaster' ? 'YOU' : 'DOODHVAALA';

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

  useEffect(() => {
    if (!position) {
      setLocationName('Locating...');
      return;
    }

    let cancelled = false;

    reverseGeocode(position.latitude, position.longitude).then((name) => {
      if (!cancelled) setLocationName(name);
    });

    return () => { cancelled = true; };
  }, [position]);

  const handleHistory = () => {
    setHistoryClicked(true);
    setTimeout(() => setHistoryClicked(false), 2000);
  };

  return (
    <div className={styles.card}>
      <div className={styles.name}>{displayName}</div>

      <div className={styles.statusRow}>
        <div className={`${styles.dot} ${dotClass}`} />
        <span className={styles.statusText}>{statusLabel}</span>
      </div>

      <div className={styles.sectionLabel}>CURRENT LOCATION</div>
      <div className={styles.sectionValue}>{locationName}</div>

      <div className={styles.divider} />

      {historyClicked ? (
        <div className={styles.comingSoon}>Coming soon</div>
      ) : (
        <button className={styles.historyBtn} onClick={handleHistory}>
          <span>LOCATION HISTORY</span>
          <span className={styles.arrow}>→</span>
        </button>
      )}
    </div>
  );
}
