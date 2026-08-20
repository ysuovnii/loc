import { io } from 'socket.io-client';

let socket = null;

export function connectSocket(accessCode) {
  if (socket) {
    console.log('[Socket] Reusing existing connection');
    return socket;
  }

  console.log('[Socket] Connecting to', import.meta.env.VITE_SOCKET_URL);

  socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: { accessCode },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    console.log('[Socket] Disconnecting');
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
