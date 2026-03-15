import DefineMessage from '../lib/DefineMessage.js';
import { config } from '../config/index.js';

const cooldowns = new Map();

/**
 * @param {import('@whiskeysockets/baileys').WASocket} sock
 * @param {import('@whiskeysockets/baileys').proto.IWebMessageInfo} m
 * @param {import('../lib/PluginLoader.js').PluginLoader} pluginLoader
 */
export const handleMessage = async (sock, m, pluginLoader) => {
  try {
    // Initialize and build the message object
    const M = await new DefineMessage(m, sock).build();
    
    // Ignore messages without content or not starting with prefix
    if (!M.content || !M.content.startsWith(config.PREFIX)) return;

    const args = M.content.slice(config.PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = pluginLoader.getCommand(commandName);

    if (!command) return;

    // Owner check
    if (command.ownerOnly && M.sender.jid !== config.OWNER) {
      return M.reply('❌ This command is for the owner only.');
    }

    // Cooldown check
    const now = Date.now();
    const cooldownAmount = (command.cooldown || 3) * 1000;
    const cooldownKey = `${M.sender.jid}-${command.name}`;
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
      await command.execute(M, args, sock, pluginLoader);
    } catch (error) {
      console.error(`❌ Error executing command ${command.name}:`, error);
      await M.react('❌');
      await M.reply(`❌ Error: ${error.message}`);
    }
  } catch (error) {
    console.error('❌ Error in handleMessage:', error);
  }
};
