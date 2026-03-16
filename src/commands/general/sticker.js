import BaseCommand from '../../core/BaseCommand.js';

export default class StickerCommand extends BaseCommand {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'sticker',
      aliases: ['s'],
      description: 'Convert image or video to sticker.'
    });
  }

  async execute(M) {
    const isMedia = M.mediaType === 'image' || M.mediaType === 'video';
    const isQuotedMedia = M.quoted && (M.quoted.type === 'imageMessage' || M.quoted.type === 'videoMessage');

    if (!isMedia && !isQuotedMedia) {
      return M.reply('❌ Please reply to an image or video with .sticker');
    }

    let buffer;
    try {
      if (isQuotedMedia) {
        buffer = await M.quoted.download();
      } else {
        buffer = await M.download();
      }
    } catch (error) {
      console.error('Error downloading media for sticker:', error);
      return M.reply('❌ Failed to download media.');
    }

    if (!buffer) return M.reply('❌ Failed to download media.');

    await M.reply(buffer, 'sticker');
  }
}
