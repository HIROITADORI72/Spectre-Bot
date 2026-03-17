import BaseCommand from '../../core/BaseCommand.js';
import axios from 'axios';

export default class TranslateCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'translate',
      aliases: ['tr'],
      description: 'Translate text to a specified language.'
    });
  }

  async execute(M, args) {
    const textToTranslate = M.quoted ? M.quoted.content : args.slice(1).join(' ');
    const targetLang = args[0] || 'en';

    if (!textToTranslate) return M.reply('❌ Please provide text to translate or reply to a message.');

    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`;
      const { data } = await axios.get(url);
      
      const translation = data[0].map(item => item[0]).join('');
      const detectedLang = data[2];

      const responseText = `🌍 *Translation Result*\n\n` +
                           `📥 *From:* ${detectedLang}\n` +
                           `📤 *To:* ${targetLang}\n\n` +
                           `📝 *Original:* ${textToTranslate}\n\n` +
                           `✅ *Translated:* ${translation}`;
      
      await M.reply(responseText);
    } catch (error) {
      console.error('Error in translate command:', error);
      await M.reply('❌ Translation failed.');
    }
  }
}
