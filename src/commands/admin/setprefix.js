import BaseCommand from '../../core/BaseCommand.js';
import { config } from '../../config/index.js';

export default class SetPrefixCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'setprefix',
      description: 'Change the bot prefix.',
      ownerOnly: true
    });
  }

  async execute(M, args) {
    if (args.length === 0) return M.reply(`❌ Current prefix is \`${config.PREFIX}\`. Usage: \`${config.PREFIX}setprefix <new_prefix>\``);

    const newPrefix = args[0];
    if (newPrefix.length > 2) return M.reply('❌ Prefix must be 1 or 2 characters long.');

    config.PREFIX = newPrefix;
    // Logic for saving to config or database should be here
    await M.reply(`✅ Prefix changed to \`${newPrefix}\`.`);
  }
}
