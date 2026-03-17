import BaseCommand from '../../core/BaseCommand.js';

export default class DemoteCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'demote',
      description: 'Demote a group admin to regular member.',
      groupOnly: true,
      adminOnly: true
    });
  }

  async execute(M, args) {
    if (!M.group.isBotAdmin) return M.reply('❌ I need to be an admin to demote users.');

    const target = M.mentioned[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return M.reply('❌ Please mention a user or provide their number.');

    try {
      await this.client.groupParticipantsUpdate(M.chat, [target], 'demote');
      await M.reply('✅ User demoted to regular member.');
    } catch (error) {
      console.error('Error demoting user:', error);
      await M.reply('❌ Failed to demote user.');
    }
  }
}
