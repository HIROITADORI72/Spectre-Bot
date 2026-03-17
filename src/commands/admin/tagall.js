import BaseCommand from '../../core/BaseCommand.js';

export default class TagAllCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'tagall',
      aliases: ['everyone'],
      description: 'Tag all members in the group.',
      groupOnly: true,
      adminOnly: true
    });
  }

  async execute(M, args) {
    const groupMetadata = await this.client.groupMetadata(M.chat);
    const participants = groupMetadata.participants;
    const mentions = participants.map(p => p.id);

    let text = `📢 *Attention Everyone!*\n\n`;
    if (args.length > 0) text += `📝 *Message:* ${args.join(' ')}\n\n`;
    
    participants.forEach((p, i) => {
      text += `${i + 1}. @${p.id.split('@')[0]}\n`;
    });

    await this.client.sendMessage(M.chat, { text, mentions });
  }
}
