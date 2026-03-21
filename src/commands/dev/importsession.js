import BaseCommand from '../../core/BaseCommand.js';
import mongoose from 'mongoose';

export default class ImportSessionCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'importsession',
      aliases: ['impsession', 'loadsession'],
      description: 'Import a session from a base64 string.',
      category: 'dev',
      ownerOnly: true
    });
  }

  async execute(M, args) {
    if (args.length === 0) {
      return M.reply('❌ Please provide a session string.\n\nUsage: `.importsession <session_string>`');
    }

    try {
      const sessionString = args.join('');
      
      if (!/^[A-Za-z0-9+/=]+$/.test(sessionString)) {
        return M.reply('❌ Invalid session string format. Must be valid base64.');
      }

      const decoded = Buffer.from(sessionString, 'base64').toString();
      const creds = JSON.parse(decoded);

      const Session = mongoose.model('Session');
      await Session.findByIdAndUpdate('creds', { data: JSON.stringify(creds) }, { upsert: true });

      await M.reply('✅ Session imported successfully!\n\n🔄 Restarting bot in 3 seconds...');
      
      setTimeout(() => process.exit(0), 3000);
    } catch (error) {
      console.error('Error importing session:', error);
      if (error instanceof SyntaxError) {
        await M.reply('❌ Invalid session string. Failed to parse JSON.');
      } else {
        await M.reply(`❌ Error: ${error.message}`);
      }
    }
  }
}
