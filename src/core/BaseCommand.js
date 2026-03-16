/**
 * Base class for all Spectre-Bot commands.
 */
export default class BaseCommand {
  /**
   * @param {import('@whiskeysockets/baileys').WASocket} client - The Baileys socket client.
   * @param {Object} options - Command configuration options.
   * @param {string} options.name - The primary name of the command.
   * @param {string[]} [options.aliases=[]] - Alternative names for the command.
   * @param {string} [options.category='general'] - The category the command belongs to.
   * @param {string} [options.description=''] - A brief description of what the command does.
   * @param {string} [options.usage=''] - Instructions on how to use the command.
   * @param {number} [options.cooldown=3] - Cooldown period in seconds.
   * @param {boolean} [options.ownerOnly=false] - Whether the command is restricted to the bot owner.
   * @param {boolean} [options.adminOnly=false] - Whether the command is restricted to group admins.
   * @param {boolean} [options.groupOnly=false] - Whether the command can only be used in groups.
   */
  constructor(client, options) {
    this.client = client;
    this.name = options.name;
    this.aliases = options.aliases || [];
    this.category = options.category || 'general';
    this.description = options.description || '';
    this.usage = options.usage || '';
    this.cooldown = options.cooldown || 3;
    this.ownerOnly = options.ownerOnly || false;
    this.adminOnly = options.adminOnly || false;
    this.groupOnly = options.groupOnly || false;
    this.loader = options.loader;
  }

  /**
   * The main execution method for the command.
   * Must be overridden by subclasses.
   * @param {Object} M - The processed message object.
   * @param {string[]} args - The command arguments.
   * @abstract
   */
  async execute(M, args) {
    throw new Error(`Command ${this.name} does not implement execute() method.`);
  }
}
