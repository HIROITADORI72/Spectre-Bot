import BaseCommand from '../../core/BaseCommand.js';
import mongoose from 'mongoose';

export default class ExportSessionCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'exportsession',
      aliases: ['expsession', 'savesession'],
      description: 'Export the current session as a base64 string.',
      category: 'dev',
      ownerOnly: true
    });
  }

  async execute(M, args) {
    try {
      await M.reply('📥 Exporting session...');
      
      const Session = mongoose.model('Session');
      const creds = await Session.findById('creds');
      
      if (!creds) {
        return M.reply('❌ No session found in database.');
      }

      const sessionString = Buffer.from(creds.data).toString('base64');
      
      const chunks = sessionString.match(/.{1,1000}/g) || [];
      
      if (chunks.length === 1) {
        await M.reply(`✅ *Session String:*\n\`\`\`\n${sessionString}\n\`\`\``);
      } else {
        await M.reply(`✅ *Session String (Part 1/${chunks.length}):*\n\`\`\`\n${chunks[0]}\n\`\`\``);
        for (let i = 1; i < chunks.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          await M.reply(`*Part ${i + 1}/${chunks.length}:*\n\`\`\`\n${chunks[i]}\n\`\`\``);
        }
      }
    } catch (error) {
      console.error('Error exporting session:', error);
      await M.reply('❌ Failed to export session.');
    }
  }
}
