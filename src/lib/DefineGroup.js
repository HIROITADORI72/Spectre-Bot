/**
 * @typedef {import('@whiskeysockets/baileys').WASocket} WASocket
 * @typedef {import('@whiskeysockets/baileys').GroupMetadata} GroupMetadata
 */

export default class DefineGroup {
  /**
   * @param {string} jid
   * @param {WASocket} client
   */
  constructor(jid, client) {
    this.jid = jid;
    this.client = client;
    /** @type {GroupMetadata | null} */
    this.metadata = null;
    /** @type {string[]} */
    this.admins = [];
    this.isBotAdmin = false;
  }

  /**
   * Fetches group metadata and populates properties
   * @returns {Promise<this>}
   */
  async build() {
    try {
      this.metadata = await this.client.groupMetadata(this.jid);
      this.admins = this.metadata.participants
        .filter((p) => p.admin)
        .map((p) => p.id);
      this.isBotAdmin = this.admins.includes(this.client.user.id.split(':')[0] + '@s.whatsapp.net');
      return this;
    } catch (error) {
      console.error(`[DefineGroup] Error building group ${this.jid}:`, error);
      return this;
    }
  }

  /**
   * @returns {import('@whiskeysockets/baileys').GroupParticipant[]}
   */
  get participants() {
    return this.metadata?.participants || [];
  }

  /**
   * @param {string} jid
   */
  async kick(jid) {
    return this.client.groupParticipantsUpdate(this.jid, [jid], 'remove');
  }

  /**
   * @param {string} jid
   */
  async promote(jid) {
    return this.client.groupParticipantsUpdate(this.jid, [jid], 'promote');
  }

  /**
   * @param {string} jid
   */
  async demote(jid) {
    return this.client.groupParticipantsUpdate(this.jid, [jid], 'demote');
  }
}
