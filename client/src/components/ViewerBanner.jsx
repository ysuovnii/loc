import styles from './ViewerBanner.module.css';

export default function ViewerBanner({ role, distanceBetween = null, connectionStatus }) {
  const isViewer = role === 'viewer';

  return (
    <div className={styles.bannerContainer}>
      <div
        className={`${styles.statusIndicator} ${
          isViewer ? styles.viewerDot : styles.broadcasterDot
        }`}
      />
      <span className={styles.title}>
        {isViewer ? 'Viewer Mode' : 'Broadcaster Mode'}
      </span>
      <div className={styles.separator} />
      <span className={styles.subtitle}>
        {isViewer ? 'Tracking DOODHVAALA' : 'Transmitting Live GPS'}
      </span>
      {distanceBetween && isViewer && (
        <span className={styles.distanceBadge}>{distanceBetween} away</span>
      )}
    </div>
  );
}
