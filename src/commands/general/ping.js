import BaseCommand from '../../core/BaseCommand.js';

export default class PingCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'ping',
      aliases: ['p'],
      description: 'Check the bot latency.',
      cooldown: 5
    });
  }

  async execute(M, args) {
    const start = Date.now();
    await M.reply('🏓 Pong!');
    const end = Date.now();
    await M.reply(`Latency: ${end - start}ms`);
  }
}
