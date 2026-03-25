import BaseCommand from '../../core/BaseCommand.js';
import { SessionManager } from '../../lib/SessionManager.js';
import mongoose from 'mongoose';

export default class ExportSessionCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'exportsession',
      aliases: ['expsession', 'savesession', 'getsession'],
      description: 'Export the current session as a compressed base64 string.',
      category: 'dev',
      ownerOnly: true
    });
  }

  async execute(M, args) {
    try {
      await M.reply('📥 *Exporting session...*\n⏳ This may take a moment...');
      
      const Session = mongoose.model('Session');
      const sessionDoc = await Session.findById('creds');
      
      if (!sessionDoc) {
        return M.reply('❌ No session found in database.');
      }

      // Parse the stored credentials
      const creds = JSON.parse(sessionDoc.data);
      
      // Use SessionManager to generate compressed session string
      const sessionManager = new SessionManager();
      const result = await sessionManager.generateSessionString(creds, true);
      
      if (!result.success) {
        return M.reply(`❌ Failed to export session: ${result.error}`);
      }

      const sessionString = result.string;
      const originalSize = JSON.stringify(creds).length;
      const compressedSize = sessionString.length;
      const compressionPercent = ((1 - compressedSize / originalSize) * 100).toFixed(2);

      // Send session info first
      let infoText = `✅ *Session Exported Successfully*\n\n`;
      infoText += `📊 *Session Info:*\n`;
      infoText += `• Original Size: ${(originalSize / 1024).toFixed(2)} KB\n`;
      infoText += `• Compressed Size: ${(compressedSize / 1024).toFixed(2)} KB\n`;
      infoText += `• Compression: ${compressionPercent}%\n`;
      infoText += `• Format: Base64 (Compressed)\n\n`;
      infoText += `⚠️ *Keep this session string safe!*\n`;
      infoText += `_You can use it to restore your bot session anytime._`;
      
      await M.reply(infoText);

      // Send session string in chunks if too large
      const chunks = sessionString.match(/.{1,1000}/g) || [];
      
      if (chunks.length === 1) {
        await M.reply(`*Session String:*\n\`\`\`\n${sessionString}\n\`\`\``);
      } else {
        await M.reply(`*Session String (Part 1/${chunks.length}):*\n\`\`\`\n${chunks[0]}\n\`\`\``);
        for (let i = 1; i < chunks.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          await M.reply(`*Part ${i + 1}/${chunks.length}:*\n\`\`\`\n${chunks[i]}\n\`\`\``);
        }
      }

      await M.reply(`✅ *Export Complete*\n\nTo restore this session later, use:\n\`${this.loader.commands.get('importsession') ? '.importsession <session_string>' : 'Session import command'}\``);
    } catch (error) {
      console.error('Error exporting session:', error);
      await M.reply(`❌ Failed to export session: ${error.message}`);
    }
  }
}
