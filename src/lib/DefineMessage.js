import { getContentType, downloadContentFromMessage } from '@whiskeysockets/baileys';
import DefineGroup from './DefineGroup.js';

/**
 * @typedef {import('@whiskeysockets/baileys').proto.IWebMessageInfo} IWebMessageInfo
 * @typedef {import('@whiskeysockets/baileys').WASocket} WASocket
 */

export default class DefineMessage {
  static MESSAGE_TYPES = {
    CONVERSATION: 'conversation',
    EXTENDED_TEXT: 'extendedTextMessage',
    IMAGE: 'imageMessage',
    VIDEO: 'videoMessage',
    AUDIO: 'audioMessage',
    DOCUMENT: 'documentMessage',
    STICKER: 'stickerMessage',
    REACTION: 'reactionMessage',
    TEMPLATE: 'templateMessage',
    BUTTONS_RESPONSE: 'buttonsResponseMessage',
    LIST_RESPONSE: 'listResponseMessage',
    EPHEMERAL: 'ephemeralMessage',
    VIEW_ONCE: 'viewOnceMessage',
    VIEW_ONCE_V2: 'viewOnceMessageV2',
    VIEW_ONCE_AUDIO: 'viewOnceMessageV2' // Baileys often maps audio view once here
  };

  #M;

  /**
   * @param {IWebMessageInfo} M
   * @param {WASocket} client
   */
  constructor(M, client) {
    this.client = client;
    this.#M = M;

    // 1. Unwrap Message Layers (Ephemeral, ViewOnce)
    this.#unwrapMessage();

    const type = this.type;
    const msg = this.#M.message?.[type];

    // 2. Sender Resolution (LID to JID handling)
    const jid = this.#M.key.remoteJid;
    const isGroup = jid.endsWith('@g.us');
    const senderJid = isGroup ? this.#M.key.participant : jid;
    this.sender = {
      jid: DefineMessage.#sanitize(senderJid),
      username: this.#M.pushName || 'User',
      lid: this.#M.key.participant || this.#M.key.remoteJid // Raw LID if available
    };

    // 3. Content Extraction (Advanced)
    this.content = this.#extractContent(type, msg);
    
    // 4. External Ad Reply & Buttons
    this.adReply = msg?.contextInfo?.externalAdReply || null;
    this.buttons = msg?.buttons || msg?.templateButtons || null;

    // 5. Media type
    this.mediaType = type?.endsWith('Message') ? type.replace('Message', '') : null;

    // 6. Mentions
    this.mentioned = msg?.contextInfo?.mentionedJid || [];

    // 7. Quoted Message Reconstruction (Fixed & Enhanced)
    this.#reconstructQuoted(msg);

    // Properties to be set in build()
    this.group = null;
    this.isAdminMessage = false;
    this.urls = [];
    this.numbers = [];
  }

  #unwrapMessage() {
    if (!this.#M.message) return;
    if (this.#M.message.ephemeralMessage) {
      this.#M.message = this.#M.message.ephemeralMessage.message;
    }
    if (this.#M.message.viewOnceMessage) {
      this.#M.message = this.#M.message.viewOnceMessage.message;
    }
    if (this.#M.message.viewOnceMessageV2) {
      this.#M.message = this.#M.message.viewOnceMessageV2.message;
    }
    // Handle nested viewOnce (sometimes happens in Baileys)
    const type = Object.keys(this.#M.message || {})[0];
    if (type === 'viewOnceMessage' || type === 'viewOnceMessageV2') {
        this.#M.message = this.#M.message[type].message;
    }
  }

  #extractContent(type, msg) {
    if (!msg) return '';
    if (type === DefineMessage.MESSAGE_TYPES.CONVERSATION) return this.#M.message.conversation;
    if (type === DefineMessage.MESSAGE_TYPES.EXTENDED_TEXT) return msg.text;
    if (type === DefineMessage.MESSAGE_TYPES.BUTTONS_RESPONSE) return msg.selectedButtonId;
    if (type === DefineMessage.MESSAGE_TYPES.LIST_RESPONSE) return msg.singleSelectReply?.selectedRowId;
    if (msg.caption) return msg.caption;
    if (msg.text) return msg.text;
    return '';
  }

  #reconstructQuoted(msg) {
    const contextInfo = msg?.contextInfo;
    if (contextInfo?.quotedMessage) {
      const quoted = contextInfo.quotedMessage;
      const participant = contextInfo.participant;
      const stanzaId = contextInfo.stanzaId;
      const quotedType = getContentType(quoted);
      const quotedMsg = quoted[quotedType];

      this.quoted = {
        sender: DefineMessage.#sanitize(participant),
        type: quotedType,
        content: (() => {
          if (quotedType === DefineMessage.MESSAGE_TYPES.CONVERSATION) return quoted.conversation;
          if (quotedType === DefineMessage.MESSAGE_TYPES.EXTENDED_TEXT) return quotedMsg.text;
          if (quotedMsg?.caption) return quotedMsg.caption;
          return '';
        })() || '',
        message: quoted,
        isViewOnce: !!(quotedMsg?.viewOnce),
        react: async (emoji) => {
          return this.client.sendMessage(this.from, {
            react: { text: emoji, key: { remoteJid: this.from, fromMe: false, id: stanzaId, participant } }
          });
        },
        download: async () => {
          const mediaType = quotedType.replace('Message', '');
          const stream = await downloadContentFromMessage(quotedMsg, mediaType);
          let buffer = Buffer.from([]);
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
          }
          return buffer;
        }
      };
    }
  }

  /**
   * Async build process
   * @returns {Promise<this>}
   */
  async build() {
    try {
      this.urls = DefineMessage.#getUrls(this.content);
      this.numbers = DefineMessage.#extractNumbers(this.content);

      if (this.chat === 'group') {
        this.group = await new DefineGroup(this.from, this.client).build();
        if (this.group.admins.includes(this.sender.jid)) {
          this.isAdminMessage = true;
        }
      }
      return this;
    } catch (error) {
      console.error('[DefineMessage] Error in build():', error);
      return this;
    }
  }

  // Getters
  get raw() { return this.#M; }
  get from() { return this.#M.key.remoteJid; }
  get chat() { return this.from.endsWith('@g.us') ? 'group' : 'dm'; }
  get type() { return getContentType(this.#M.message) || ''; }
  get isFromMe() { return this.#M.key.fromMe; }
  get timestamp() { return new Date((this.#M.messageTimestamp?.low || this.#M.messageTimestamp || Date.now() / 1000) * 1000); }

  // Methods
  /**
   * @param {string|Buffer} content
   * @param {string} type
   * @param {object} options
   */
  async reply(content, type = 'text', options = {}) {
    try {
      const payload = { [type]: content, ...options };
      return this.client.sendMessage(this.from, payload, { quoted: this.#M, ...options });
    } catch (error) {
      console.error('[DefineMessage] Error in reply():', error);
      throw error;
    }
  }

  /**
   * @param {string} emoji
   */
  async react(emoji) {
    try {
      return this.client.sendMessage(this.from, { react: { text: emoji, key: this.#M.key } });
    } catch (error) {
      console.error('[DefineMessage] Error in react():', error);
      throw error;
    }
  }

  /**
   * @returns {Promise<Buffer>}
   */
  async download() {
    try {
      const type = this.type;
      const mediaType = type.replace('Message', '');
      const stream = await downloadContentFromMessage(this.#M.message[type], mediaType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      return buffer;
    } catch (error) {
      console.error('[DefineMessage] Error in download():', error);
      throw error;
    }
  }

  // LID/JID Utilities
  /**
   * Converts LID to JID if possible
   * @param {string} lid 
   */
  async lidToJid(lid) {
    const result = await this.client.onWhatsApp(lid);
    return result?.[0]?.jid || lid;
  }

  // Private Static Utilities
  static #sanitize(jid) {
    return jid ? jid.split(':')[0].split('@')[0] + '@s.whatsapp.net' : '';
  }

  static #getUrls(text) {
    const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
    return text.match(urlRegex) || [];
  }

  static #extractNumbers(text) {
    const numberRegex = /\+?\d{10,15}/g;
    return text.match(numberRegex) || [];
  }
}
