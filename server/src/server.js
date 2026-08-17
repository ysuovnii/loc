import http from 'http';
import {Server} from 'socket.io';
import app from './app.js';
import {initSocket} from './socket/socket.js'
import {initDB} from './db/connection.js';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 3000;

const initServer = async () => {
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: '*'
    }
  });

  await initDB();
  initSocket(io);

  server.on('error', (error) => {
    console.log(`[Error] Server: ${error}`);
    process.exit(1);
  });

  server.listen(PORT, () => {
    console.log(`[Initial] Server running on port ${PORT}`);
  });
}

initServer();
