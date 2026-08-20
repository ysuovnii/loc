import { useEffect, useRef, useState, useCallback } from 'react';
import { connectSocket, disconnectSocket } from '../services/socket';

export function useSocket(accessCode) {
  const [status, setStatus] = useState('connecting');
  const socketRef = useRef(null);

  useEffect(() => {
    if (!accessCode) return;

    const socket = connectSocket(accessCode);
    socketRef.current = socket;

    function onConnect() {
      console.log('[Socket] Connected');
      setStatus('online');
    }

    function onDisconnect() {
      console.log('[Socket] Disconnected');
      setStatus('offline');
    }

    function onConnectError(err) {
      console.error('[Socket] Connection error:', err.message);
      setStatus('offline');
    }

    function onReconnectAttempt(attempt) {
      console.log('[Socket] Reconnect attempt:', attempt);
      setStatus('connecting');
    }

    function onReconnect() {
      console.log('[Socket] Reconnected');
      setStatus('online');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('reconnect_attempt', onReconnectAttempt);
    socket.on('reconnect', onReconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('reconnect_attempt', onReconnectAttempt);
      socket.off('reconnect', onReconnect);
      disconnectSocket();
      socketRef.current = null;
    };
  }, [accessCode]);

  const emit = useCallback((event, data) => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit(event, data);
    }
  }, []);

  const on = useCallback((event, handler) => {
    const socket = socketRef.current;
    if (socket) {
      socket.on(event, handler);
    }
  }, []);

  const off = useCallback((event, handler) => {
    const socket = socketRef.current;
    if (socket) {
      socket.off(event, handler);
    }
  }, []);

  return { status, emit, on, off, socketRef };
}
