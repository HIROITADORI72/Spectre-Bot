import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const startWebServer = (botEmitter) => {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../../public')));

  app.post('/auth/session', (req, res) => {
    const { session } = req.body;
    if (!session) return res.status(400).send('Session string required');
    botEmitter.emit('auth_session', session);
    res.sendStatus(200);
  });

  app.post('/auth/qr', (req, res) => {
    botEmitter.emit('auth_qr');
    res.sendStatus(200);
  });

  io.on('connection', (socket) => {
    console.log('🌐 Web UI connected');
    botEmitter.on('qr', (dataUrl) => socket.emit('qr', dataUrl));
    botEmitter.on('ready', (botNumber) => socket.emit('ready', botNumber));
    botEmitter.on('session_string', (str) => socket.emit('session_string', str));
  });

  httpServer.listen(config.PORT, () => {
    console.log(`🌐 Web server running on http://localhost:${config.PORT}`);
  });

  return { io };
};
