import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.DEV
  ? 'http://localhost:3000'
  : window.location.origin;

export function createSocket(accessCode) {
  return io(SOCKET_URL, {
    auth: { accessCode },
    autoConnect: false,
  });
}
