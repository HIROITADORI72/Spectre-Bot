# Spectre — Modular WhatsApp Bot

Spectre is a modular WhatsApp bot built with Node.js, `@whiskeysockets/baileys`, and MongoDB Atlas for session persistence.

## Features
- **MongoDB Session Auth**: No QR re-scans on redeploy.
- **Web Auth UI**: Connect via QR or session string.
- **Modular Plugin System**: Easy to add new commands.
- **Hot Reload**: Commands reload without restarting the bot.
- **Session String**: Export and reuse your session easily.

## Setup
1. Clone the repository.
2. Install dependencies: `pnpm install`.
3. Create a `.env` file based on `.env.example`.
4. Run the bot: `pnpm start`.
5. Open `http://localhost:3000` to authenticate.

## Commands
- `.help`: List all commands.
- `.ping`: Check bot latency.
- `.info`: Bot status and uptime.
- `.sticker`: Convert image/video to sticker.
- `.kick`: Remove user from group (Admin only).
- `.ban`/`.unban`: Manage user access (Admin only).

## Environment Variables
- `MONGO_URI`: Your MongoDB Atlas connection string.
- `PREFIX`: Command prefix (default: `.`).
- `OWNER`: Your WhatsApp ID (e.g., `2348123456789@s.whatsapp.net`).
- `PORT`: Web server port (default: `3000`).
- `BOT_NAME`: Name of your bot.
