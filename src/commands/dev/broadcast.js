import BaseCommand from '../../core/BaseCommand.js';

export default class BroadcastCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'broadcast',
      aliases: ['bc'],
      description: 'Send a message to all chats.',
      category: 'dev',
      ownerOnly: true
    });
  }

  async execute(M, args) {
    if (args.length === 0) return M.reply('❌ Please provide a message to broadcast.');

    const message = args.join(' ');
    const chats = Object.keys(await this.client.groupFetchAllParticipating());
    
    await M.reply(`🚀 Broadcasting to ${chats.length} groups...`);
    
    let success = 0;
    let failed = 0;

    for (const chat of chats) {
      try {
        await this.client.sendMessage(chat, { text: `📢 *BROADCAST*\n\n${message}` });
        success++;
      } catch (error) {
        failed++;
      }
    }

    await M.reply(`✅ Broadcast finished.\n\n📊 *Stats:*\n- Success: ${success}\n- Failed: ${failed}`);
  }
}
