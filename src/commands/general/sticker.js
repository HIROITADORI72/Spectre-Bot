import { config } from '../../config/index.js';

export const sticker = {
  name: 'sticker',
  aliases: ['s'],
  category: 'general',
  execute: async (M, args, sock) => {
    const type = M.type;
    if (type !== 'imageMessage' && type !== 'videoMessage' && !M.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
      return M.reply('❌ Please reply to an image or video with .sticker');
    }

    let buffer;
    if (M.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
      const quoted = M.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
      // Download quoted message logic (simplified)
      buffer = await M.download(); // This is a simplified version, real implementation would need to handle quoted messages properly
    } else {
      buffer = await M.download();
    }

    if (!buffer) return M.reply('❌ Failed to download media.');

    await sock.sendMessage(M.key.remoteJid, { sticker: buffer }, { quoted: M });
  }
};

export default sticker;
