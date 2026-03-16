import BaseCommand from '../../core/BaseCommand.js';
import { config } from '../../config/index.js';

export default class HelpCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'help',
      aliases: ['h', 'menu'],
      description: 'Display all available commands.'
    });
  }

  async execute(M, args) {
    const commands = Array.from(new Set(this.loader.commands.values()));
    const categories = {};
    
    commands.forEach(cmd => {
      if (!categories[cmd.category]) categories[cmd.category] = [];
      categories[cmd.category].push(cmd.name);
    });

    let text = `📜 *${config.BOT_NAME} Commands*\n\n`;
    for (const category in categories) {
      text += `*${category.toUpperCase()}*\n`;
      text += `> ${categories[category].join(', ')}\n\n`;
    }
    text += `_Use ${config.PREFIX}command to execute._`;
    await M.reply(text);
  }
}
