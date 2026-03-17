import BaseCommand from '../../core/BaseCommand.js';
import yts from 'yt-search';

export default class YTSCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'yts',
      aliases: ['ytsearch'],
      description: 'Search for videos on YouTube.'
    });
  }

  async execute(M, args) {
    if (args.length === 0) return M.reply('❌ Please provide a search query.');

    const query = args.join(' ');
    try {
      const results = await yts(query);
      const videos = results.videos.slice(0, 5);

      if (videos.length === 0) return M.reply('❌ No results found.');

      let text = `📺 *YouTube Search Results for:* _${query}_\n\n`;
      videos.forEach((v, i) => {
        text += `${i + 1}. *${v.title}*\n`;
        text += `   🔗 ${v.url}\n`;
        text += `   ⏱️ Duration: ${v.timestamp}\n`;
        text += `   👁️ Views: ${v.views}\n\n`;
      });

      await M.reply(text);
    } catch (error) {
      console.error('Error in yts command:', error);
      await M.reply('❌ An error occurred while searching YouTube.');
    }
  }
}
