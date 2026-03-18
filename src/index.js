import mongoose from 'mongoose';
import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion, BufferJSON } from '@whiskeysockets/baileys';
import { EventEmitter } from 'events';
import QRCode from 'qrcode';
import pino from 'pino';
import { config } from './config/index.js';
import { useMongoAuthState } from './lib/useMongoAuthState.js';
import CommandLoader from './core/CommandLoader.js';
import MessageHandler from './core/MessageHandler.js';
import { startWebServer } from './web/server.js';

const botEmitter = new EventEmitter();
let sock;
let commandLoader;
let messageHandler;

async function connectToWhatsApp() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const { state, saveCreds } = await useMongoAuthState();
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Using Baileys v${version.join('.')}, isLatest: ${isLatest}`);

    sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: ['Spectre', 'Chrome', '1.0.0'],
      getMessage: async () => ({ conversation: '' }),
      shouldSyncHistoryMessage: () => false,
      syncFullHistory: false,
      markOnlineOnConnect: false
    });

    // Initialize core systems
    commandLoader = new CommandLoader(sock);
    await commandLoader.loadAll();
    messageHandler = new MessageHandler(sock, commandLoader);

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

        // Generate session string using BufferJSON.replacer for correct Buffer serialization
        const creds = state.creds;
        const sessionString = Buffer.from(JSON.stringify(creds, BufferJSON.replacer)).toString('base64');
        botEmitter.emit('session_string', sessionString);
      }
    });

    sock.ev.on('messages.upsert', async (m) => {
      if (m.type === 'notify') {
        for (const msg of m.messages) {
          if (!msg.key.fromMe) {
            await messageHandler.handle(msg);
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
  startWebServer(botEmitter);

  botEmitter.on('auth_session', async (sessionStr) => {
    try {
      const decoded = Buffer.from(sessionStr, 'base64').toString('utf-8');

      // Parse the raw creds
      const creds = JSON.parse(decoded);

      // Re-serialize with BufferJSON.replacer so useMongoAuthState can read it correctly
      const data = JSON.stringify(creds, BufferJSON.replacer);

      const Session = mongoose.model('Session');
      await Session.findByIdAndUpdate('creds', { data }, { upsert: true, new: true });

      console.log('✅ Session string applied, restarting bot...');
      setTimeout(() => process.exit(0), 1000);
    } catch (e) {
      console.error('❌ Invalid session string:', e.message);
    }
  });

  await connectToWhatsApp();
})();
