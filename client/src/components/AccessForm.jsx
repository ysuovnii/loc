export default function AccessForm({
  accessCode,
  onAccessCodeChange,
  onSubmit,
  disabled,
  status,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!disabled && accessCode.trim()) onSubmit();
  };

  const isConnecting = status === 'CONNECTING';
  const hasError = status === 'INVALID CODE' || status === 'SERVER OFFLINE';
  const isConnected = status === 'CONNECTED';

  return (
    <form className="access-form" onSubmit={handleSubmit}>
      <div
        className={[
          'input-shell',
          isConnecting && 'input-shell--connecting',
          hasError && 'input-shell--error',
          isConnected && 'input-shell--success',
          accessCode && 'input-shell--filled',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <input
          id="access-code"
          className="pixel-input"
          type="text"
          value={accessCode}
          onChange={(e) => onAccessCodeChange(e.target.value.toUpperCase())}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          disabled={disabled || isConnected}
          maxLength={16}
          aria-label="Access code"
          placeholder="ENTER CODE"
        />
        {isConnecting && (
          <span className="input-loading-dots" aria-hidden="true">
            <span /><span /><span />
          </span>
        )}
        {!isConnecting && !isConnected && (
          <button
            type="submit"
            className="access-submit-btn"
            disabled={disabled || !accessCode.trim()}
            aria-label="Connect"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            </svg>
          </button>
        )}
      </div>

      {hasError && (
        <span className="access-error-text">{status}</span>
      )}
      {isConnected && (
        <span className="access-success-text">CONNECTED</span>
      )}
    </form>
  );
}
