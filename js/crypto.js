/**
 * Crypto utility for PIN hashing using Web Crypto API
 *
 * Security Approach:
 * - PBKDF2 with SHA-256
 * - 100,000 iterations (OWASP recommended minimum)
 * - 16-byte random salt per PIN
 * - 256-bit derived key
 *
 * Limitations:
 * This is CLIENT-SIDE security. With physical device access, determined
 * attackers can:
 * - Extract hashed PINs from localStorage
 * - Modify JavaScript to bypass hashing
 * - Use browser devtools to inspect memory
 *
 * This hashing protects against:
 * - Casual snooping of localStorage
 * - Accidental exposure in screenshots/logs
 * - Simple data exfiltration attacks
 *
 * Users should:
 * - Enable device encryption
 * - Use device lock screen
 * - Not share devices
 */

'use strict';

// Get crypto reference (works in both browser and Node test environments)
// Use a getter function to ensure we get crypto at runtime, not at module load time
// Check globalThis first to support test environments
const getCrypto = () => {
  // In test environments, crypto is set on globalThis
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto;
  }
  // In browsers, crypto is a global
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  }
  // Fallback: try to access crypto directly (works in some environments)
  if (typeof self !== 'undefined' && self.crypto) {
    return self.crypto;
  }
  throw new Error('Web Crypto API not available');
};

/**
 * Hash a PIN using PBKDF2
 * @param {string} pin - The PIN to hash (typically 4 digits)
 * @param {Uint8Array|null} salt - Salt to use, or null to generate new one
 * @returns {Promise<{hash: string, salt: string}>} Hex-encoded hash and salt
 */
export async function hashPin(pin, salt = null) {
  const cryptoAPI = getCrypto();

  // Generate salt if not provided (for new PINs)
  if (!salt) {
    salt = cryptoAPI.getRandomValues(new Uint8Array(16));
  }

  const encoder = new TextEncoder();
  const pinBuffer = encoder.encode(pin);

  // Import PIN as key material
  const keyMaterial = await cryptoAPI.subtle.importKey(
    'raw',
    pinBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derive hash using PBKDF2
  const hashBuffer = await cryptoAPI.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // OWASP recommended minimum
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 256 bits output
  );

  // Convert to hex for storage
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

  return { hash: hashHex, salt: saltHex };
}

/**
 * Verify a PIN against a stored hash
 * @param {string} pin - The PIN to verify
 * @param {string} storedHash - Hex-encoded stored hash
 * @param {string} storedSalt - Hex-encoded stored salt
 * @returns {Promise<boolean>} True if PIN matches
 */
export async function verifyPin(pin, storedHash, storedSalt) {
  try {
    // Convert stored salt back to Uint8Array
    const saltArray = new Uint8Array(
      storedSalt.match(/.{2}/g).map(byte => parseInt(byte, 16))
    );

    const { hash } = await hashPin(pin, saltArray);

    // Constant-time comparison (simple version)
    // Note: For true constant-time, use a dedicated library in production
    return hash === storedHash;
  } catch (err) {
    console.error('PIN verification error:', err);
    return false;
  }
}

/**
 * Generate a random salt
 * @returns {Uint8Array} 16-byte random salt
 */
export function generateSalt() {
  const cryptoAPI = getCrypto();
  return cryptoAPI.getRandomValues(new Uint8Array(16));
}

/**
 * Check if Web Crypto API is available
 * @returns {boolean} True if crypto.subtle is available
 */
export function isCryptoAvailable() {
  try {
    const cryptoAPI = getCrypto();
    return typeof cryptoAPI !== 'undefined' &&
           typeof cryptoAPI.subtle !== 'undefined' &&
           typeof cryptoAPI.getRandomValues === 'function';
  } catch {
    return false;
  }
}

/**
 * Migrate an existing plaintext PIN to hashed format
 * @param {string} plaintextPin - The plaintext PIN
 * @returns {Promise<{hash: string, salt: string}>} Hashed PIN data
 */
export async function migratePlaintextPin(plaintextPin) {
  if (!plaintextPin || plaintextPin.length < 4) {
    throw new Error('Invalid PIN for migration');
  }

  return await hashPin(plaintextPin);
}
