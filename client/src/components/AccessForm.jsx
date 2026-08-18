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

  return (
    <form className="access-form" onSubmit={handleSubmit}>
      <div
        className={[
          'input-shell',
          isConnecting && 'input-shell--connecting',
          hasError && 'input-shell--error',
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
          disabled={disabled}
          maxLength={16}
          aria-label="Access code"
          placeholder="ENTER CODE"
        />
        {isConnecting && (
          <span className="input-loading-dots" aria-hidden="true">
            <span /><span /><span />
          </span>
        )}
      </div>
    </form>
  );
}
