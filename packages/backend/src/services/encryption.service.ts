import CryptoJS from 'crypto-js';

export class EncryptionService {
  private static readonly SECRET_KEY = process.env.ENCRYPTION_KEY;
  private static readonly ALGORITHM = 'AES';

  /**
   * Encrypts sensitive data
   */
  static encrypt(data: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, this.SECRET_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', data,  error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypts sensitive data
   */
  static decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', encryptedData, error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypts customer names for storage
   */
  static encryptCustomerName(customerName: string): string {
    return this.encrypt(customerName);
  }

  /**
   * Decrypts customer names for display
   */
  static decryptCustomerName(encryptedName: string): string {
    try {
      // If the name doesn't appear to be encrypted (doesn't contain base64 characters), return it as is
      if (!this.isEncrypted(encryptedName)) {
        return encryptedName;
      }
      return this.decrypt(encryptedName);
    } catch (error) {
      console.warn('Failed to decrypt customer name, returning original:', encryptedName, error);
      return encryptedName;
    }
  }

  /**
   * Checks if a string appears to be encrypted
   */
  private static isEncrypted(data: string): boolean {
    // AES encrypted data usually has base64 characters and a specific length
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    return base64Regex.test(data) && data.length > 20;
  }

  /**
   * Generates a secure hash for sensitive operations
   */
  static generateHash(data: string): string {
    return CryptoJS.SHA256(data + this.SECRET_KEY).toString();
  }

  /**
   * Validates if data matches hash
   */
  static validateHash(data: string, hash: string): boolean {
    const computedHash = this.generateHash(data);
    return computedHash === hash;
  }
}
