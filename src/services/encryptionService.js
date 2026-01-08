import CryptoJS from 'crypto-js';

/**
 * Derive encryption key from user's password
 * TRUE ZERO-KNOWLEDGE: Key is derived on-demand and never stored
 * @param {string} email - User's email (used as salt)
 * @param {string} password - User's password
 * @returns {string} Derived encryption key
 */
export const deriveEncryptionKey = (email, password) => {
  // Use email as salt to make key unique per user
  const salt = CryptoJS.SHA256(email).toString();

  // Derive key using PBKDF2 (Password-Based Key Derivation Function 2)
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32, // 256 bits
    iterations: 10000,  // Number of iterations (more = more secure but slower)
  }).toString();

  return key;
};

/**
 * Encrypt data
 * TRUE ZERO-KNOWLEDGE: Key must be provided explicitly, never retrieved from storage
 * @param {Object|Array|string} data - Data to encrypt
 * @param {string} key - Encryption key (REQUIRED)
 * @returns {string} Encrypted data as base64 string
 */
export const encryptData = (data, key) => {
  if (!key) {
    throw new Error('Encryption key is required');
  }

  // Convert data to JSON string
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);

  // Encrypt using AES
  const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();

  return encrypted;
};

/**
 * Decrypt data
 * TRUE ZERO-KNOWLEDGE: Key must be provided explicitly, never retrieved from storage
 * @param {string} encryptedData - Encrypted data
 * @param {string} key - Encryption key (REQUIRED)
 * @returns {Object|Array|string} Decrypted data
 */
export const decryptData = (encryptedData, key) => {
  if (!key) {
    throw new Error('Encryption key is required');
  }

  try {
    // Decrypt using AES
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      throw new Error('Decryption failed - wrong key or corrupted data');
    }

    // Try to parse as JSON, otherwise return as string
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data - wrong password or corrupted data');
  }
};

/**
 * Encrypt entire database export
 * Used for cloud sync
 */
export const encryptExport = (exportData) => {
  return {
    encrypted: encryptData(exportData),
    timestamp: Date.now(),
    version: 1,
  };
};

/**
 * Decrypt entire database export
 * Used for cloud sync
 */
export const decryptExport = (encryptedExport) => {
  return decryptData(encryptedExport.encrypted);
};

/**
 * Verify password is correct using encrypted canary
 * @param {string} email - User's email
 * @param {string} password - Password to verify
 * @param {string} encryptedCanary - Encrypted canary value to test
 * @returns {boolean} True if password is correct
 */
export const verifyPassword = (email, password, encryptedCanary) => {
  try {
    const key = deriveEncryptionKey(email, password);
    const decrypted = decryptData(encryptedCanary, key);
    return decrypted === 'CANARY_VALID';
  } catch {
    return false;
  }
};

/**
 * Create encrypted canary for password verification
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {string} Encrypted canary value
 */
export const createPasswordCanary = (email, password) => {
  const key = deriveEncryptionKey(email, password);
  return encryptData('CANARY_VALID', key);
};
