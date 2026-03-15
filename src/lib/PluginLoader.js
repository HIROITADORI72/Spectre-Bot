import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PluginLoader {
  constructor() {
    this.commands = new Map();
    this.commandsPath = path.join(__dirname, '../commands');
  }

  async loadCommands() {
    const categories = fs.readdirSync(this.commandsPath);
    for (const category of categories) {
      const categoryPath = path.join(this.commandsPath, category);
      if (fs.lstatSync(categoryPath).isDirectory()) {
        const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
        for (const file of files) {
          await this.loadCommand(category, file);
        }
      }
    }
    this.watchCommands();
  }

  async loadCommand(category, file) {
    const filePath = path.join(this.commandsPath, category, file);
    const fileUrl = pathToFileURL(filePath).href + `?update=${Date.now()}`;
    try {
      const { default: command } = await import(fileUrl);
      if (command && command.name) {
        command.category = category;
        this.commands.set(command.name, command);
        if (command.aliases) {
          command.aliases.forEach(alias => this.commands.set(alias, command));
        }
        console.log(`✅ Loaded command: ${command.name}`);
      }
    } catch (error) {
      console.error(`❌ Error loading command ${file}:`, error);
    }
  }

  watchCommands() {
    const watcher = chokidar.watch(this.commandsPath, { ignoreInitial: true });
    watcher.on('change', async (filePath) => {
      const relativePath = path.relative(this.commandsPath, filePath);
      const [category, file] = relativePath.split(path.sep);
      if (category && file && file.endsWith('.js')) {
        console.log(`🔄 Reloading command: ${file}`);
        await this.loadCommand(category, file);
      }
    });
  }

  getCommand(name) {
    return this.commands.get(name);
  }
}
