const STATUS_COLORS = {
  live: 'status-live',
  waiting: 'status-waiting',
  denied: 'status-denied',
  disconnected: 'status-disconnected',
  error: 'status-error',
  idle: 'status-idle',
  connecting: 'status-connecting',
};

export default function StatusIndicator({ label, status = 'idle', variant }) {
  const colorClass = STATUS_COLORS[variant] ?? STATUS_COLORS.idle;
  const isLive = variant === 'live';

  return (
    <div className="status-indicator pixel-stat">
      {label && <span className="status-label">{label}</span>}
      <span className={`status-value ${colorClass}`}>
        <span
          className={`status-dot ${isLive ? 'status-dot--pulse' : ''}`}
          aria-hidden="true"
        />
        {status}
      </span>
    </div>
  );
}
