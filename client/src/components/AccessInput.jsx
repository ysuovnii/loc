import { useState, useRef } from 'react';
import { verifyAccessCode } from '../services/api';
import styles from './AccessInput.module.css';

export default function AccessInput({ onVerified }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');

    try {
      const data = await verifyAccessCode(trimmed);
      onVerified(data.role, trimmed);
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
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) handleSubmit();
  };

  return (
    <div className={styles.wrapper}>
      <input
        ref={inputRef}
        className={`${styles.input} ${error ? styles.error : ''}`}
        type="text"
        value={code}
        onChange={(e) => {
          setCode(e.target.value.toUpperCase());
          setError('');
        }}
        onKeyDown={handleKeyDown}
        placeholder="Enter access code"
        maxLength={16}
        disabled={loading}
        spellCheck={false}
        autoComplete="off"
        autoFocus
      />
      {loading && <div className={styles.spinner} />}
      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  );
}
