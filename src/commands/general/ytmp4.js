import BaseCommand from '../../core/BaseCommand.js';
import axios from 'axios';

export default class YTMP4Command extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'ytmp4',
      aliases: ['mp4'],
      description: 'Download YouTube video as MP4.'
    });
  }

  async execute(M, args) {
    if (args.length === 0) return M.reply('❌ Please provide a YouTube video URL.');

    const url = args[0];
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) return M.reply('❌ Please provide a valid YouTube URL.');

    try {
      await M.reply('📥 Downloading YouTube MP4...');
      
      // Using a public API for YouTube MP4 downloading
      const response = await axios.get(`https://api.lolhuman.xyz/api/ytmp4?apikey=FREE&url=${encodeURIComponent(url)}`);
      const videoData = response.data;

      if (!videoData.result || !videoData.result.link) {
        return M.reply('❌ Failed to find the video link.');
      }

      const videoUrl = videoData.result.link;
      const title = videoData.result.title || 'YouTube MP4';

      await this.client.sendMessage(M.chat, {
        video: { url: videoUrl },
        caption: `🎥 *YouTube Video:* ${title}`
      }, { quoted: M });
    } catch (error) {
      console.error('Error in ytmp4 command:', error);
      await M.reply('❌ An error occurred while downloading the YouTube MP4.');
    }
  }
}
