import os from 'os';
import { config } from '../../config/index.js';

export const ping = {
  name: 'ping',
  aliases: ['p'],
  category: 'general',
  cooldown: 5,
  execute: async (M) => {
    const start = Date.now();
    await M.reply('🏓 Pong!');
    const end = Date.now();
    await M.reply(`Latency: ${end - start}ms`);
  }
};

export const info = {
  name: 'info',
  category: 'general',
  execute: async (M) => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const osInfo = `${os.platform()} ${os.release()}`;
    
    const text = `🤖 *${config.BOT_NAME} Info*\n\n` +
                 `⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s\n` +
                 `🧠 *Memory:* ${memory} MB\n` +
                 `💻 *OS:* ${osInfo}\n` +
                 `👑 *Owner:* ${config.OWNER}`;
    await M.reply(text);
  }
};

export const help = {
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

export default [ping, info, help];
