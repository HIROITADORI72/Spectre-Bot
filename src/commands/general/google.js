import BaseCommand from '../../core/BaseCommand.js';
import googleIt from 'google-it';

export default class GoogleCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'google',
      aliases: ['g', 'search'],
      description: 'Search on Google.'
    });
  }

  async execute(M, args) {
    if (args.length === 0) return M.reply('❌ Please provide a search query.');

    const query = args.join(' ');
    try {
      const results = await googleIt({ query });
      const topResults = results.slice(0, 5);

      if (topResults.length === 0) return M.reply('❌ No results found.');

      let text = `🔍 *Google Search Results for:* _${query}_\n\n`;
      topResults.forEach((res, i) => {
        text += `${i + 1}. *${res.title}*\n`;
        text += `   🔗 ${res.link}\n`;
        text += `   📝 ${res.snippet}\n\n`;
      });

      await M.reply(text);
    } catch (error) {
      console.error('Error in google command:', error);
      await M.reply('❌ An error occurred while searching Google.');
    }
  }
}
