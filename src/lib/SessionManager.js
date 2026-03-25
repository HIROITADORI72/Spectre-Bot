import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';
import crypto from 'crypto';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

/**
 * SessionManager - Handles session string generation, compression, and restoration
 * Features:
 * - Automatic compression to reduce string size
 * - Optional encryption for security
 * - Validation and error handling
 * - Seamless import/export
 */
export class SessionManager {
  constructor(encryptionKey = null) {
    this.encryptionKey = encryptionKey;
    this.algorithm = 'aes-256-cbc';
  }

  /**
   * Generate a compressed session string
   */
  async generateSessionString(creds, compress = true) {
    try {
      // Serialize credentials
      const jsonString = JSON.stringify(creds);
      
      let data = Buffer.from(jsonString);

      // Compress if enabled
      if (compress) {
        data = await gzipAsync(data);
      }

      // Encrypt if key is provided
      if (this.encryptionKey) {
        data = this.encrypt(data);
      }

      // Convert to base64 for easy transmission
      const sessionString = data.toString('base64');
      
      return {
        success: true,
        string: sessionString,
        compressed: compress,
        encrypted: !!this.encryptionKey,
        size: sessionString.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Restore credentials from session string
   */
  async restoreFromSessionString(sessionString) {
    try {
      // Validate base64
      if (!/^[A-Za-z0-9+/=]+$/.test(sessionString.trim())) {
        throw new Error('Invalid base64 format');
      }

      let data = Buffer.from(sessionString.trim(), 'base64');

      // Decrypt if encrypted
      if (this.encryptionKey) {
        data = this.decrypt(data);
      }

      // Decompress if compressed
      try {
        data = await gunzipAsync(data);
      } catch (e) {
        // If decompression fails, assume it's not compressed
        // This maintains backward compatibility
      }

      // Parse JSON
      const creds = JSON.parse(data.toString('utf-8'));

      // Validate structure
      if (!creds.noiseKey || !creds.signedIdentityKey) {
        throw new Error('Invalid credentials structure');
      }

      return {
        success: true,
        creds
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Encrypt data using AES-256-CBC
   */
  encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.encryptionKey, 'hex'), iv);
    
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Return IV + encrypted data
    return Buffer.concat([iv, encrypted]);
  }

  /**
   * Decrypt data using AES-256-CBC
   */
  decrypt(data) {
    const iv = data.slice(0, 16);
    const encrypted = data.slice(16);
    
    const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.encryptionKey, 'hex'), iv);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted;
  }

  /**
   * Generate a secure encryption key
   */
  static generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate session string format
   */
  static validateSessionString(sessionString) {
    if (!sessionString || typeof sessionString !== 'string') {
      return { valid: false, error: 'Session string must be a non-empty string' };
    }

    if (!/^[A-Za-z0-9+/=]+$/.test(sessionString.trim())) {
      return { valid: false, error: 'Invalid base64 format' };
    }

    const decoded = Buffer.from(sessionString.trim(), 'base64');
    if (decoded.length < 100) {
      return { valid: false, error: 'Session string appears to be too small' };
    }

    return { valid: true };
  }

  /**
   * Get session string info without restoring
   */
  getSessionInfo(sessionString) {
    const validation = SessionManager.validateSessionString(sessionString);
    if (!validation.valid) {
      return { valid: false, error: validation.error };
    }

    const decoded = Buffer.from(sessionString.trim(), 'base64');
    
    return {
      valid: true,
      size: sessionString.length,
      compressedSize: decoded.length,
      compressionRatio: ((1 - decoded.length / sessionString.length) * 100).toFixed(2) + '%',
      encrypted: this.encryptionKey ? true : false
    };
  }
}

export default SessionManager;
