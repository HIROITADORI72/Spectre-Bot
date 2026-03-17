import BaseCommand from '../../core/BaseCommand.js';
import axios from 'axios';

export default class YTMP3Command extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'ytmp3',
      aliases: ['mp3'],
      description: 'Download YouTube video as MP3.'
    });
  }

  async execute(M, args) {
    if (args.length === 0) return M.reply('❌ Please provide a YouTube video URL.');

    const url = args[0];
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) return M.reply('❌ Please provide a valid YouTube URL.');

    try {
      await M.reply('📥 Downloading YouTube MP3...');
      
      // Using a public API for YouTube MP3 downloading
      const response = await axios.get(`https://api.lolhuman.xyz/api/ytmp3?apikey=FREE&url=${encodeURIComponent(url)}`);
      const audioData = response.data;

      if (!audioData.result || !audioData.result.link) {
        return M.reply('❌ Failed to find the audio link.');
      }

      const audioUrl = audioData.result.link;
      const title = audioData.result.title || 'YouTube MP3';

      await this.client.sendMessage(M.chat, {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }, { quoted: M });
    } catch (error) {
      console.error('Error in ytmp3 command:', error);
      await M.reply('❌ An error occurred while downloading the YouTube MP3.');
    }
  }
}
