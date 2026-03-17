import BaseCommand from '../../core/BaseCommand.js';
import { Brainly } from 'brainly-scraper-v2';

export default class BrainlyCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'brainly',
      description: 'Search for answers on Brainly.'
    });
    this.brainly = new Brainly('id'); // Default to Indonesian, can be changed
  }

  async execute(M, args) {
    if (args.length === 0) return M.reply('❌ Please provide a question.');

    const query = args.join(' ');
    try {
      const results = await this.brainly.search(query);
      if (results.length === 0) return M.reply('❌ No results found on Brainly.');

      const firstResult = results[0];
      let text = `🧠 *Brainly Answer for:* _${query}_\n\n`;
      text += `📝 *Question:* ${firstResult.question.content}\n\n`;
      
      if (firstResult.answers.length > 0) {
        text += `✅ *Answer:* ${firstResult.answers[0].content.replace(/<[^>]*>?/gm, '')}\n`;
      } else {
        text += `❌ No verified answer yet.`;
      }

      await M.reply(text);
    } catch (error) {
      console.error('Error in brainly command:', error);
      await M.reply('❌ An error occurred while searching Brainly.');
    }
  }
}
