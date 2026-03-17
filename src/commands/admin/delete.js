import BaseCommand from '../../core/BaseCommand.js';

export default class DeleteCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'delete',
      aliases: ['del'],
      description: 'Delete a message by replying to it.',
      groupOnly: true,
      adminOnly: true
    });
  }

  async execute(M) {
    if (!M.quoted) return M.reply('❌ Please reply to a message to delete it.');

    try {
      await this.client.sendMessage(M.chat, {
        delete: {
          remoteJid: M.chat,
          fromMe: M.quoted.fromMe,
          id: M.quoted.id,
          participant: M.quoted.sender
        }
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      await M.reply('❌ Failed to delete message. Make sure I have admin permissions.');
    }
  }
}
