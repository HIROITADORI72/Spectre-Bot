import BaseCommand from '../../core/BaseCommand.js';
import util from 'util';

export default class EvalCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'eval',
      aliases: ['e', 'ev'],
      description: 'Execute JavaScript code.',
      category: 'dev',
      ownerOnly: true
    });
  }

  async execute(M, args) {
    if (args.length === 0) return M.reply('❌ Please provide code to evaluate.');

    const code = args.join(' ');
    try {
      let evaled = eval(code);
      if (typeof evaled !== 'string') {
        evaled = util.inspect(evaled);
      }
      await M.reply(`✅ *Result:*\n\`\`\`js\n${evaled}\n\`\`\``);
    } catch (error) {
      await M.reply(`❌ *Error:*\n\`\`\`js\n${error.message}\n\`\`\``);
    }
  }
}
