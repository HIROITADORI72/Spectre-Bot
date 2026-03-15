import os from 'os';
import { config } from '../../config/index.js';

export default {
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
