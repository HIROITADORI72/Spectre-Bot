import mongoose from 'mongoose';
import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { EventEmitter } from 'events';
import QRCode from 'qrcode';
import pino from 'pino';
import { config } from './config/index.js';
import { useMongoAuthState } from './lib/useMongoAuthState.js';
import { PluginLoader } from './lib/PluginLoader.js';
import { handleMessage } from './events/message.js';
import { startWebServer } from './web/server.js';

const botEmitter = new EventEmitter();
const pluginLoader = new PluginLoader();

async function connectToWhatsApp() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const { state, saveCreds } = await useMongoAuthState();
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Using Baileys v${version.join('.')}, isLatest: ${isLatest}`);

    const sock = makeWASocket.default({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: ['Spectre', 'Chrome', '1.0.0'],
      getMessage: async () => ({ conversation: '' })
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        const dataUrl = await QRCode.toDataURL(qr);
        botEmitter.emit('qr', dataUrl);
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
        if (shouldReconnect) connectToWhatsApp();
      } else if (connection === 'open') {
        console.log('✅ WhatsApp connection opened');
        const botNumber = sock.user.id.split(':')[0];
        botEmitter.emit('ready', botNumber);

        // Generate session string (base64 of creds)
        const creds = await state.creds;
        const sessionString = Buffer.from(JSON.stringify(creds)).toString('base64');
        botEmitter.emit('session_string', sessionString);
      }
    });

    sock.ev.on('messages.upsert', async (m) => {
      if (m.type === 'notify') {
        for (const msg of m.messages) {
          if (!msg.key.fromMe) {
            await handleMessage(sock, msg, pluginLoader);
          }
        }
      }
    });

    return sock;
  } catch (error) {
    console.error('❌ Connection error:', error);
    setTimeout(connectToWhatsApp, 5000);
  }
}

// Start everything
(async () => {
  await pluginLoader.loadCommands();
  startWebServer(botEmitter);
  
  botEmitter.on('auth_session', async (sessionStr) => {
    try {
      const creds = JSON.parse(Buffer.from(sessionStr, 'base64').toString());
      // Save to MongoDB
      const Session = mongoose.model('Session');
      await Session.findByIdAndUpdate('creds', { data: JSON.stringify(creds) }, { upsert: true });
      console.log('✅ Session string applied, restarting bot...');
      process.exit(0); // Restarting via process manager or manual
    } catch (e) {
      console.error('❌ Invalid session string');
    }
  });

  botEmitter.on('auth_qr', () => {
    console.log('🔄 QR Auth requested');
    // Re-trigger connection if needed
  });

  await connectToWhatsApp();
})();
