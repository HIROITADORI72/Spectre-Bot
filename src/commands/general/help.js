import { config } from '../../config/index.js';

export default {
  name: 'help',
  aliases: ['h', 'menu'],
  category: 'general',
  execute: async (M, args, sock, pluginLoader) => {
    const commands = Array.from(new Set(pluginLoader.commands.values()));
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
};
