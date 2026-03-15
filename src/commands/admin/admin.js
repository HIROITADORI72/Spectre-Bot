export const kick = {
  name: 'kick',
  category: 'admin',
  ownerOnly: true,
  execute: async (M, args) => {
    if (M.chat !== 'group') return M.reply('❌ This command is for groups only.');
    if (!M.group.isBotAdmin) return M.reply('❌ I need to be an admin to kick users.');

    const target = M.mentioned[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return M.reply('❌ Please mention a user or provide their number.');

    await M.group.kick(target);
    await M.reply('✅ User kicked.');
  }
};

export const ban = {
  name: 'ban',
  category: 'admin',
  ownerOnly: true,
  execute: async (M, args) => {
    const target = M.mentioned[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
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
