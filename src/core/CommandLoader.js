import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Dynamically loads and watches for changes in command files.
 */
export default class CommandLoader {
  /**
   * @param {import('@whiskeysockets/baileys').WASocket} client - The Baileys socket client.
   */
  constructor(client) {
    this.client = client;
    this.commands = new Map();
    this.aliases = new Map();
    this.commandsPath = path.join(__dirname, '../commands');
  }

  /**
   * Scans the commands directory and loads all .js files.
   */
  async loadAll() {
    if (!fs.existsSync(this.commandsPath)) {
      console.warn(`⚠️ Commands directory not found at: ${this.commandsPath}`);
      return;
    }

    const categories = fs.readdirSync(this.commandsPath);
    for (const category of categories) {
      const categoryPath = path.join(this.commandsPath, category);
      if (fs.lstatSync(categoryPath).isDirectory()) {
        const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
        for (const file of files) {
          await this.load(category, file);
        }
      }
    }
    this.watch();
  }

  /**
   * Loads a single command file.
   * @param {string} category - The category name (folder name).
   * @param {string} file - The filename.
   */
  async load(category, file) {
    const filePath = path.join(this.commandsPath, category, file);
    const fileUrl = pathToFileURL(filePath).href + `?update=${Date.now()}`;
    
    try {
      const { default: CommandClass } = await import(fileUrl);
      
      // Ensure the exported value is a class and not a simple object
      if (typeof CommandClass !== 'function') {
        console.warn(`⚠️ Command ${category}/${file} does not export a class. Skipping...`);
        return;
      }

      const command = new CommandClass(this.client, { category, loader: this });
      
      if (command.name) {
        this.commands.set(command.name.toLowerCase(), command);
        if (command.aliases && Array.isArray(command.aliases)) {
          command.aliases.forEach(alias => {
            this.aliases.set(alias.toLowerCase(), command.name.toLowerCase());
          });
        }
        console.log(`✅ Loaded command: ${category}/${command.name}`);
      } else {
        console.warn(`⚠️ Command ${category}/${file} is missing a 'name' property.`);
      }
    } catch (error) {
      console.error(`❌ Error loading command ${category}/${file}:`, error);
    }
  }

  /**
   * Watches the commands directory for file changes and reloads them.
   */
  watch() {
    const watcher = chokidar.watch(this.commandsPath, { ignoreInitial: true });
    watcher.on('change', async (filePath) => {
      const relativePath = path.relative(this.commandsPath, filePath);
      const parts = relativePath.split(path.sep);
      if (parts.length === 2 && parts[1].endsWith('.js')) {
        const [category, file] = parts;
        console.log(`🔄 Reloading command: ${category}/${file}`);
        await this.load(category, file);
      }
    });
  }

  /**
   * Retrieves a command by its name or alias.
   * @param {string} name - The command name or alias.
   * @returns {BaseCommand|undefined}
   */
  get(name) {
    const commandName = name.toLowerCase();
    return this.commands.get(commandName) || this.commands.get(this.aliases.get(commandName));
  }
}
