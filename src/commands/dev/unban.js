import BaseCommand from '../../core/BaseCommand.js';

export default class UnbanCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'unban',
      aliases: ['ub'],
      description: 'Unban a user from the group.',
      category: 'dev',
      adminOnly: true,
      groupOnly: true
    });
  }

  async execute(M, args) {
    if (!M.isGroup) return M.reply('❌ This command can only be used in groups.');
    if (!M.isAdmin) return M.reply('❌ You must be a group admin to use this command.');
    if (!M.isBotAdmin) return M.reply('❌ I must be a group admin to unban users.');

    if (args.length === 0) return M.reply('❌ Please provide a phone number to unban.');

    const number = args[0].replace(/\D/g, '');
    const jid = `${number}@s.whatsapp.net`;

    try {
      await this.client.groupParticipantsUpdate(M.from, [jid], 'add');
      await M.reply(`✅ User unbanned successfully.`);
    } catch (error) {
      await M.reply(`❌ Failed to unban user: ${error.message}`);
    }
  }
}
