import BaseCommand from '../../core/BaseCommand.js';

export default class PromoteCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'promote',
      description: 'Promote a user to group admin.',
      groupOnly: true,
      adminOnly: true
    });
  }

  async execute(M, args) {
    if (!M.group.isBotAdmin) return M.reply('❌ I need to be an admin to promote users.');

    const target = M.mentioned[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return M.reply('❌ Please mention a user or provide their number.');

    try {
      await this.client.groupParticipantsUpdate(M.chat, [target], 'promote');
      await M.reply('✅ User promoted to administrator.');
    } catch (error) {
      console.error('Error promoting user:', error);
      await M.reply('❌ Failed to promote user.');
    }
  }
}
