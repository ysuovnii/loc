import { useState, useEffect, useRef, useCallback } from 'react';

export function useGeolocation(onUpdate, enabled = true) {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return;
    }

    if (!navigator.geolocation) {
      console.error('[GPS] Geolocation not supported');
      setStatus('error');
      setError('Geolocation not supported');
      return;
    }

    console.log('[GPS] Starting watchPosition');
    setStatus('searching');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        console.log('[GPS] Location update:', latitude, longitude);
        setStatus('online');
        setError(null);
        if (onUpdateRef.current) {
          onUpdateRef.current({ latitude, longitude, accuracy });
        }
      },
      (err) => {
        console.error('[GPS] Error:', err.message);
        setStatus('error');
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => {
      console.log('[GPS] Stopping watchPosition');
      stop();
    };
  }, [enabled, stop]);

  return { status, error, stop };
}
