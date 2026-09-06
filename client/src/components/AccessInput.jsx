import { useState, useRef, useEffect } from 'react';
import { verifyAccessCode } from '../services/api';
import styles from './AccessInput.module.css';

export default function AccessInput({ onVerified }) {
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState('idle');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const busy = phase === 'authenticating' || phase === 'established';

  useEffect(() => {
    if (error) inputRef.current?.focus();
  }, [error]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const active = document.activeElement;
      const isTyping =
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.isContentEditable);
      if (isTyping) return;
      if (e.key.length === 1) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSubmit = async () => {
    const trimmed = code.trim();
    if (!trimmed || busy) return;

    setPhase('authenticating');
    setError('');

    try {
      const data = await verifyAccessCode(trimmed);
      setPhase('established');
      window.setTimeout(() => onVerified(data.role, trimmed), 900);
    } catch (err) {
      if (err.message === 'NETWORK_ERROR') {
        setError('Server unreachable');
      } else if (err.message === 'Invalid Access Code') {
        setError('Invalid access code');
      } else if (err.message === 'Access Code is required') {
        setError('Enter an access code');
      } else {
        setError(err.message || 'Connection failed');
      }
      setPhase('idle');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.inputWrapper} ${code ? styles.hasValue : ''}`}
        onClick={() => inputRef.current?.focus()}
      >
        <span className={styles.displayText}>{code}</span>
        <input
          ref={inputRef}
          className={styles.hiddenInput}
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder=""
          maxLength={16}
          disabled={busy}
          spellCheck={false}
          autoComplete="off"
        />
        {!code && (
          <span className={styles.placeholder}>ENTER ACCESS CODE</span>
        )}
      </div>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
