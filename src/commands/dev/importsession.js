import BaseCommand from '../../core/BaseCommand.js';
import { SessionManager } from '../../lib/SessionManager.js';
import mongoose from 'mongoose';
import { BufferJSON } from '@whiskeysockets/baileys';

export default class ImportSessionCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'importsession',
      aliases: ['impsession', 'loadsession', 'restoresession'],
      description: 'Import a session from a compressed base64 string.',
      category: 'dev',
      ownerOnly: true
    });
  }

  async execute(M, args) {
    if (args.length === 0) {
      return M.reply(`❌ *No session string provided*\n\nUsage: \`${this.loader.commands.get('help') ? '.help importsession' : '.importsession <session_string>'}\``);
    }

    try {
      const sessionString = args.join('');
      
      // Validate session string format
      const validation = SessionManager.validateSessionString(sessionString);
      if (!validation.valid) {
        return M.reply(`❌ *Invalid Session String*\n\n${validation.error}\n\nMake sure you copied the entire session string correctly.`);
      }

      await M.reply('🔄 *Restoring session...*\n⏳ Please wait, this may take a moment...');

      // Use SessionManager to restore credentials
      const sessionManager = new SessionManager();
      const restoreResult = await sessionManager.restoreFromSessionString(sessionString);
      
      if (!restoreResult.success) {
        return M.reply(`❌ *Failed to Restore Session*\n\n${restoreResult.error}\n\nPlease make sure the session string is valid and complete.`);
      }

      const creds = restoreResult.creds;

      // Re-serialize with BufferJSON.replacer for proper storage
      const data = JSON.stringify(creds, BufferJSON.replacer);

      const Session = mongoose.model('Session');
      await Session.findByIdAndUpdate('creds', { data }, { upsert: true, new: true });

      await M.reply(`✅ *Session Restored Successfully!*\n\n🔄 *Bot will restart in 3 seconds...*\n\nYour session has been restored and the bot will reconnect with the new credentials.`);
      
      // Restart after a delay
      setTimeout(() => process.exit(0), 3000);
    } catch (error) {
      console.error('Error importing session:', error);
      await M.reply(`❌ *Unexpected Error*\n\n${error.message}\n\nPlease try again or contact support.`);
    }
  }
}
