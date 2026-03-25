import BaseCommand from '../../core/BaseCommand.js';
import { config } from '../../config/index.js';

export default class HelpCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'help',
      aliases: ['h', 'menu', 'commands'],
      description: 'Display all available commands or info about a specific command.'
    });
  }

  async execute(M, args) {
    // If a specific command is requested
    if (args.length > 0) {
      return this.showCommandHelp(M, args[0]);
    }

    // Show main help menu
    return this.showMainMenu(M);
  }

  async showMainMenu(M) {
    const commands = Array.from(new Set(this.loader.commands.values()));
    const categories = {};
    
    // Organize commands by category, excluding 'dev'
    commands.forEach(cmd => {
      if (cmd.category === 'dev') return;
      if (!categories[cmd.category]) categories[cmd.category] = [];
      categories[cmd.category].push(cmd.name);
    });

    // Category emojis for visual appeal
    const categoryEmojis = {
      general: '📚',
      admin: '👮',
      utility: '🔧',
      media: '🎬',
      fun: '🎮',
      education: '🎓'
    };

    let text = `🤖 Hello *@${M.sender.split('@')[0]}*, I'm *${config.BOT_NAME}*\n\n`;
    text += `🔖 *Prefix*: [ ${config.PREFIX} ]\n\n`;
    text += `📚 *Below are my available commands*:\n\n`;

    // Add each category with commands
    for (const [category, cmds] of Object.entries(categories)) {
      const emoji = categoryEmojis[category] || '📌';
      text += `*${emoji} ${category.charAt(0).toUpperCase() + category.slice(1)} ${emoji}*\n`;
      text += `➮\`\`\`${cmds.join(', ')}\`\`\`\n\n`;
    }

    text += `📘 *Note:* To get more information about a command, use *${config.PREFIX}help <cmd_name>*\n`;
    text += `Example: *${config.PREFIX}help ping*\n\n`;
    text += `_Prefix: ${config.PREFIX}_`;

    await M.reply(text);
  }

  async showCommandHelp(M, cmdName) {
    const commands = Array.from(new Set(this.loader.commands.values()));
    const cmd = commands.find(c => c.name === cmdName || c.aliases?.includes(cmdName));

    if (!cmd) {
      return M.reply(`❌ Command *${cmdName}* not found.\n\nUse *${config.PREFIX}help* to see all commands.`);
    }

    // Prevent showing dev commands
    if (cmd.category === 'dev') {
      return M.reply(`❌ Command *${cmdName}* not found.\n\nUse *${config.PREFIX}help* to see all commands.`);
    }

    let helpText = `🔍 *Command Information*\n\n`;
    helpText += `*Name:* ${cmd.name}\n`;
    
    if (cmd.aliases && cmd.aliases.length > 0) {
      helpText += `*Aliases:* ${cmd.aliases.join(', ')}\n`;
    }
    
    helpText += `*Category:* ${cmd.category}\n`;
    helpText += `*Description:* ${cmd.description || 'No description available'}\n`;
    
    if (cmd.usage) {
      helpText += `*Usage:* ${config.PREFIX}${cmd.usage}\n`;
    }

    if (cmd.ownerOnly) {
      helpText += `⚠️ *Restriction:* Owner Only\n`;
    } else if (cmd.adminOnly) {
      helpText += `⚠️ *Restriction:* Admin Only\n`;
    } else if (cmd.groupOnly) {
      helpText += `⚠️ *Restriction:* Group Only\n`;
    }

    if (cmd.cooldown) {
      helpText += `⏱️ *Cooldown:* ${cmd.cooldown}s\n`;
    }

    helpText += `\n_Use ${config.PREFIX}${cmd.name} to execute this command._`;

    await M.reply(helpText);
  }
}
