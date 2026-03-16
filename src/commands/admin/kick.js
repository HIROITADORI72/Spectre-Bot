import BaseCommand from '../../core/BaseCommand.js';

export default class KickCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'kick',
      description: 'Kick a user from the group.',
      groupOnly: true,
      adminOnly: true
    });
  }

  async execute(M, args) {
    if (!M.group.isBotAdmin) return M.reply('❌ I need to be an admin to kick users.');

    const target = M.mentioned[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return M.reply('❌ Please mention a user or provide their number.');

    try {
      await M.group.kick(target);
      await M.reply('✅ User kicked.');
    } catch (error) {
      console.error('Error kicking user:', error);
      await M.reply('❌ Failed to kick user.');
    }
  }
}
