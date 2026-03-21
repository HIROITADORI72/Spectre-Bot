import BaseCommand from '../../core/BaseCommand.js';

export default class RestartCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'restart',
      description: 'Restart the bot.',
      category: 'dev',
      ownerOnly: true
    });
  }

  async execute(M) {
    await M.reply('🔄 Restarting bot...');
    setTimeout(() => process.exit(0), 1000);
  }
}
