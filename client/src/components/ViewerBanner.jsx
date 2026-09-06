import styles from './ViewerBanner.module.css';
import { statusMeta } from '../services/status';

export default function ViewerBanner({ status }) {
  const meta = statusMeta(status);

  return (
    <div className={styles.chip}>
      <span className={styles.appName}>TRACKER</span>
      <span className={styles.rule} />
      <span className={`${styles.dot} ${styles[meta.tone]}`} />
      <span className={styles.status}>{meta.label}</span>
    </div>
  );
}