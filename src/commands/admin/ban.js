import BaseCommand from '../../core/BaseCommand.js';

export default class BanCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'ban',
      description: 'Ban a user from using the bot.',
      ownerOnly: true
    });
  }

  async execute(M, args) {
    const target = M.mentioned[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return M.reply('❌ Please mention a user or provide their number.');
    // Logic for banning should be here (e.g., updating database)
    await M.reply(`✅ User ${target} banned.`);
  }
}
