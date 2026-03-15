import { DefineGroup } from '../../lib/DefineMessage.js';

export const kick = {
  name: 'kick',
  category: 'admin',
  ownerOnly: true,
  execute: async (M, args, sock) => {
    if (!M.isGroup) return M.reply('❌ This command is for groups only.');
    const group = await DefineGroup(sock, M.key.remoteJid);
    if (!group.isBotAdmin(group.participants)) return M.reply('❌ I need to be an admin to kick users.');

    const target = M.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return M.reply('❌ Please mention a user or provide their number.');

    await sock.groupParticipantsUpdate(M.key.remoteJid, [target], 'remove');
    await M.reply('✅ User kicked.');
  }
};

export const ban = {
  name: 'ban',
  category: 'admin',
  ownerOnly: true,
  execute: async (M, args) => {
    const target = M.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return M.reply('❌ Please mention a user or provide their number.');
    // In a real bot, you'd save this to a database. For now, we'll just mock it.
    await M.reply(`✅ User ${target} banned.`);
  }
};

export const unban = {
  name: 'unban',
  category: 'admin',
  ownerOnly: true,
  execute: async (M, args) => {
    const target = args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null;
    if (!target) return M.reply('❌ Please provide the user number.');
    await M.reply(`✅ User ${target} unbanned.`);
  }
};

export default [kick, ban, unban];
