export default {
  name: 'ping',
  aliases: ['p'],
  category: 'general',
  cooldown: 5,
  execute: async (M) => {
    const start = Date.now();
    await M.reply('🏓 Pong!');
    const end = Date.now();
    await M.reply(`Latency: ${end - start}ms`);
  }
};
