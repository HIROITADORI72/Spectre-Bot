import BaseCommand from '../../core/BaseCommand.js';
import OpenAI from 'openai';

export default class AICommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'ai',
      aliases: ['gpt', 'ask'],
      description: 'Ask anything to AI.'
    });
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'sk-...' // User should provide their own API key in .env
    });
  }

  async execute(M, args) {
    if (args.length === 0) return M.reply('❌ Please provide a prompt for the AI.');

    const prompt = args.join(' ');
    try {
      await M.reply('🤖 AI is thinking...');
      
      const completion = await this.openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-3.5-turbo'
      });

      const response = completion.choices[0].message.content;
      await M.reply(`🤖 *AI Response:*\n\n${response}`);
    } catch (error) {
      console.error('Error in ai command:', error);
      await M.reply('❌ AI service is currently unavailable. Please check your API key.');
    }
  }
}
