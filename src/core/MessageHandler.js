import DefineMessage from '../lib/DefineMessage.js';
import { config } from '../config/index.js';

/**
 * Handles incoming messages and executes the appropriate commands.
 */
export default class MessageHandler {
  /**
   * @param {import('@whiskeysockets/baileys').WASocket} client - The Baileys socket client.
   * @param {CommandLoader} commandLoader - The command loader instance.
   */
  constructor(client, commandLoader) {
    this.client = client;
    this.commandLoader = commandLoader;
    this.cooldowns = new Map();
  }

  /**
   * Processes a new message.
   * @param {import('@whiskeysockets/baileys').proto.IWebMessageInfo} m - The raw message from Baileys.
   */
  async handle(m) {
    try {
      // Process and normalize the message
      const M = await new DefineMessage(m, this.client).build();

      // Basic filters: ignore empty messages or those without prefix
      if (!M.content || !M.content.startsWith(config.PREFIX)) return;

      // Extract command name and arguments
      const args = M.content.slice(config.PREFIX.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();
      const command = this.commandLoader.get(commandName);

      if (!command) return;

      // Check permissions and constraints
      if (this.checkPermissions(M, command)) {
        await this.execute(M, command, args);
      }
    } catch (error) {
      console.error('❌ Error in MessageHandler.handle:', error);
    }
  }

  /**
   * Checks if the user has permission to execute the command.
   * @param {Object} M - The processed message object.
   * @param {BaseCommand} command - The command instance.
   * @returns {boolean}
   */
  checkPermissions(M, command) {
    // Owner restriction
    if (command.ownerOnly && M.sender.jid !== config.OWNER) {
      M.reply('❌ This command is restricted to the bot owner.');
      return false;
    }

    // Group-only restriction
    if (command.groupOnly && !M.isGroup) {
      M.reply('❌ This command can only be used in groups.');
      return false;
    }

    // Admin-only restriction
    if (command.adminOnly && !M.sender.isAdmin) {
      M.reply('❌ This command is restricted to group administrators.');
      return false;
    }

    // Cooldown check
    if (this.isOnCooldown(M.sender.jid, command)) {
      return false;
    }

    return true;
  }

  /**
   * Handles command cooldowns.
   * @param {string} jid - The sender's JID.
   * @param {BaseCommand} command - The command instance.
   * @returns {boolean}
   */
  isOnCooldown(jid, command) {
    const now = Date.now();
    const cooldownAmount = (command.cooldown || 3) * 1000;
    const cooldownKey = `${jid}-${command.name}`;

    if (this.cooldowns.has(cooldownKey)) {
      const expirationTime = this.cooldowns.get(cooldownKey) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        // Optional: only reply if more than 1 second left
        if (timeLeft > 1) {
          // M.reply(`⏳ Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
        return true;
      }
    }

    this.cooldowns.set(cooldownKey, now);
    setTimeout(() => this.cooldowns.delete(cooldownKey), cooldownAmount);
    return false;
  }

  /**
   * Executes the command with error handling and reaction.
   * @param {Object} M - The processed message object.
   * @param {BaseCommand} command - The command instance.
   * @param {string[]} args - The command arguments.
   */
  async execute(M, command, args) {
    try {
      // await M.react('⏳'); // Optional: react while processing
      await command.execute(M, args);
      // await M.react('✅'); // Optional: react on success
    } catch (error) {
      console.error(`❌ Error executing command ${command.name}:`, error);
      await M.react('❌');
      await M.reply(`❌ Error: ${error.message}`);
    }
  }
}
