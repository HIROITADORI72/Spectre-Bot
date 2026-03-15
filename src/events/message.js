import { DefineMessage } from '../lib/DefineMessage.js';
import { config } from '../config/index.js';

const cooldowns = new Map();

export const handleMessage = async (sock, m, pluginLoader) => {
  const M = DefineMessage(sock, m);
  if (!M || !M.body.startsWith(config.PREFIX)) return;

  const args = M.body.slice(config.PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = pluginLoader.getCommand(commandName);

  if (!command) return;

  // Owner check
  if (command.ownerOnly && M.sender !== config.OWNER) {
    return M.reply('❌ This command is for the owner only.');
  }

  // Cooldown check
  const now = Date.now();
  const cooldownAmount = (command.cooldown || 3) * 1000;
  const cooldownKey = `${M.sender}-${command.name}`;
  if (cooldowns.has(cooldownKey)) {
    const expirationTime = cooldowns.get(cooldownKey) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return M.reply(`⏳ Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
    }
  }
  cooldowns.set(cooldownKey, now);
  setTimeout(() => cooldowns.delete(cooldownKey), cooldownAmount);

  try {
    await command.execute(M, args, sock);
  } catch (error) {
    console.error(`❌ Error executing command ${command.name}:`, error);
    await M.react('❌');
    await M.reply(`❌ Error: ${error.message}`);
  }
};
