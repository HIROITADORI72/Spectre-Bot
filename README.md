# Spectre — Modular WhatsApp Bot (Refactored)

Spectre is a powerful and efficient WhatsApp bot built with Node.js, `@whiskeysockets/baileys`, and MongoDB Atlas for session persistence. This version features a completely refactored modular architecture, inspired by the Devi WhatsApp bot.

## 🚀 Key Features

- **MongoDB Session Auth**: No QR re-scans on redeploy.
- **Web Auth UI**: Connect via QR or session string.
- **Modular Class-based Architecture**: Commands are organized as classes, inheriting from a `BaseCommand` for consistency and ease of development.
- **Dynamic Command Loading**: Commands are automatically loaded and reloaded on-the-fly without restarting the bot.
- **Enhanced Message Handling**: A robust `MessageHandler` manages command execution, argument parsing, and permissions.
- **Permission System**: Built-in support for Owner-only, Admin-only, and Group-only commands.
- **Cooldown System**: Prevent command spamming with configurable cooldown periods.
- **Improved Functionality**: New commands and enhanced core logic for a seamless user experience.

## 📁 Project Structure

```text
src/
├── core/
│   ├── BaseCommand.js      # Base class for all commands
│   ├── CommandLoader.js    # Dynamic command loading and watching
│   └── MessageHandler.js   # Centralized message and command handling
├── commands/
│   ├── admin/              # Owner and administrator commands
│   └── general/            # General purpose commands
├── lib/                    # Core libraries and message wrappers
├── config/                 # Configuration and environment variables
└── index.js                # Main entry point
```

## 🛠️ How to Add a New Command

Create a new `.js` file in the appropriate category under `src/commands/`.

```javascript
import BaseCommand from '../../core/BaseCommand.js';

export default class MyCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'mycommand',
      aliases: ['mc'],
      description: 'A brief description of my command.',
      cooldown: 5,
      groupOnly: true
    });
  }

  async execute(M, args) {
    await M.reply('Hello from my new modular command!');
  }
}
```

## ⚙️ Configuration

1. Create a `.env` file based on `.env.example`.
2. Set your `MONGO_URI`, `PREFIX`, and `OWNER` JID.
3. Run `pnpm install` and `pnpm start`.
4. Open `http://localhost:3000` to authenticate.

## 🤝 Reference

This project structure was improved based on the [WhatsApp-Bot-Devi](https://github.com/Debanjan-San/WhatsApp-Bot-Devi) architecture.

---
Built with ❤️ by Spectre-Bot Team.
