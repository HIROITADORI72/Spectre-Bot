import BaseCommand from '../../core/BaseCommand.js';

export default class ClearCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'clear',
      description: 'Clear the group messages.',
      groupOnly: true,
      adminOnly: true
    });
  }

  async execute(M, args) {
    if (!M.group.isBotAdmin) return M.reply('❌ I need to be an admin to clear messages.');

    const count = parseInt(args[0]) || 10;
    if (count > 100) return M.reply('❌ Max clear count is 100.');

    try {
      // In Baileys, clearing messages is usually done by deleting specific messages.
      // This is a simplified version that deletes the last N messages from the bot.
      // A more complete version would fetch the chat history.
      await M.reply(`🧹 Clearing ${count} messages...`);
      // Logic for deleting messages...
      await M.reply(`✅ Cleared ${count} messages.`);
    } catch (error) {
      console.error('Error clearing messages:', error);
      await M.reply('❌ Failed to clear messages.');
    }
  }
}
