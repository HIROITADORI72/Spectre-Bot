import BaseCommand from '../../core/BaseCommand.js';
import axios from 'axios';

export default class TikTokCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'tiktok',
      aliases: ['tt'],
      description: 'Download a TikTok video without watermark.'
    });
  }

  async execute(M, args) {
    if (args.length === 0) return M.reply('❌ Please provide a TikTok video URL.');

    const url = args[0];
    if (!url.includes('tiktok.com')) return M.reply('❌ Please provide a valid TikTok URL.');

    try {
      await M.reply('📥 Downloading TikTok video...');
      
      // Using a public API for TikTok downloading
      const response = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`);
      const videoData = response.data;

      if (!videoData.video || !videoData.video.noWatermark) {
        return M.reply('❌ Failed to find the video without watermark.');
      }

      const videoUrl = videoData.video.noWatermark;
      const caption = `🎥 *TikTok Download*\n\n` +
                      `👤 *User:* ${videoData.author.nickname}\n` +
                      `📝 *Description:* ${videoData.title || 'No description'}`;

      await this.client.sendMessage(M.chat, {
        video: { url: videoUrl },
        caption
      }, { quoted: M });
    } catch (error) {
      console.error('Error in tiktok command:', error);
      await M.reply('❌ An error occurred while downloading the TikTok video.');
    }
  }
}
