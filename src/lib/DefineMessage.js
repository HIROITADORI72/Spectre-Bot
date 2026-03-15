import { getContentType, downloadContentFromMessage } from '@whiskeysockets/baileys';

export const DefineMessage = (sock, m) => {
  if (!m.message) return null;
  const type = getContentType(m.message);
  const body = (type === 'conversation') ? m.message.conversation : (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : (type === 'imageMessage') ? m.message.imageMessage.caption : (type === 'videoMessage') ? m.message.videoMessage.caption : '';
  const isGroup = m.key.remoteJid.endsWith('@g.us');
  const sender = isGroup ? m.key.participant : m.key.remoteJid;
  const pushName = m.pushName || 'User';

  return {
    ...m,
    type,
    body,
    isGroup,
    sender,
    pushName,
    reply: async (text) => sock.sendMessage(m.key.remoteJid, { text }, { quoted: m }),
    react: async (emoji) => sock.sendMessage(m.key.remoteJid, { react: { text: emoji, key: m.key } }),
    download: async () => {
      const messageType = type.replace('Message', '');
      const stream = await downloadContentFromMessage(m.message[type], messageType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      return buffer;
    }
  };
};

export const DefineGroup = async (sock, jid) => {
  const metadata = await sock.groupMetadata(jid);
  return {
    ...metadata,
    isAdmin: (participants) => participants.filter(p => p.admin).map(p => p.id),
    isBotAdmin: (participants) => participants.find(p => p.id === sock.user.id)?.admin || false
  };
};
