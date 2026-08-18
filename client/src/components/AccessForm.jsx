export default function AccessForm({
  accessCode,
  onAccessCodeChange,
  onSubmit,
  disabled,
  status,
  errorMessage,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!disabled) onSubmit();
  };

  return (
    <form className="access-form" onSubmit={handleSubmit}>
      <label className="input-label" htmlFor="access-code">
        [ ENTER ACCESS CODE ]
      </label>
      <input
        id="access-code"
        className="pixel-input"
        type="text"
        value={accessCode}
        onChange={(e) => onAccessCodeChange(e.target.value.toUpperCase())}
        placeholder="XXXXXXXX"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        disabled={disabled}
        maxLength={16}
      />
      <button type="submit" className="pixel-button" disabled={disabled || !accessCode.trim()}>
        CONNECT
      </button>
      {status === 'CONNECTING' && (
        <p className="form-status status-connecting">CONNECTING...</p>
      )}
      {status === 'INVALID CODE' && (
        <p className="form-status status-error">{errorMessage || 'INVALID ACCESS CODE'}</p>
      )}
      {status === 'SERVER OFFLINE' && (
        <p className="form-status status-error">SERVER OFFLINE</p>
      )}
    </form>
  );
}
