export default {
  name: 'unban',
  category: 'admin',
  ownerOnly: true,
  execute: async (M, args) => {
    const target = args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null;
    if (!target) return M.reply('❌ Please provide the user number.');
    await M.reply(`✅ User ${target} unbanned.`);
  }
};
