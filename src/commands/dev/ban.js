import BaseCommand from '../../core/BaseCommand.js';

export default class BanCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'ban',
      aliases: ['b'],
      description: 'Ban a user from the group.',
      category: 'dev',
      adminOnly: true,
      groupOnly: true
    });
  }

  async execute(M, args) {
    if (!M.isGroup) return M.reply('❌ This command can only be used in groups.');
    if (!M.isAdmin) return M.reply('❌ You must be a group admin to use this command.');
    if (!M.isBotAdmin) return M.reply('❌ I must be a group admin to ban users.');

    const mention = M.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mention) return M.reply('❌ Please mention a user to ban.');

    try {
      await this.client.groupParticipantsUpdate(M.from, [mention], 'remove');
      await M.reply(`✅ User banned successfully.`);
    } catch (error) {
      await M.reply(`❌ Failed to ban user: ${error.message}`);
    }
  }
}
