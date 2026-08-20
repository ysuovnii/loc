import app from './app.js';
import http from 'http';
import { Server } from 'socket.io';
import { initSocket } from './socket/socket.js';
import initDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

const initServer = async () => {
  const io = new Server(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ['GET', 'POST'],
    },
    maxHttpBufferSize: 1e4,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  await initDB();
  initSocket(io);

  server.on('error', (error) => {
    console.error(`[Error] Server: ${error.message}`);
    process.exit(1);
  });

  server.listen(PORT, () => {
    console.log(`[Initial] Server running on PORT: ${PORT}`);
  });
};

initServer();
