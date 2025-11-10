/**
 * Tests for js/crypto.js PIN hashing utilities
 * Validates Phase 2.1 security implementation
 */

describe('PIN Crypto Utilities', () => {
  let hashPin, verifyPin, generateSalt, isCryptoAvailable, migratePlaintextPin;

  beforeAll(async () => {
    // Dynamic import of ES6 module
    const cryptoModule = await import('../../js/crypto.js');
    hashPin = cryptoModule.hashPin;
    verifyPin = cryptoModule.verifyPin;
    generateSalt = cryptoModule.generateSalt;
    isCryptoAvailable = cryptoModule.isCryptoAvailable;
    migratePlaintextPin = cryptoModule.migratePlaintextPin;
  });

  describe('isCryptoAvailable', () => {
    test('should return true in test environment', () => {
      expect(isCryptoAvailable()).toBe(true);
    });
  });

  describe('generateSalt', () => {
    test('should generate 16-byte salt', () => {
      const salt = generateSalt();
      expect(salt).toBeInstanceOf(Uint8Array);
      expect(salt.length).toBe(16);
    });

    test('should generate different salts each time', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(salt1).not.toEqual(salt2);
    });

    test('should generate random values (not all zeros)', () => {
      const salt = generateSalt();
      const hasNonZero = Array.from(salt).some(byte => byte !== 0);
      expect(hasNonZero).toBe(true);
    });
  });

  describe('hashPin', () => {
    test('should hash PIN and return hash and salt', async () => {
      const pin = '1234';
      const result = await hashPin(pin);

      expect(result).toHaveProperty('hash');
      expect(result).toHaveProperty('salt');
      expect(typeof result.hash).toBe('string');
      expect(typeof result.salt).toBe('string');
      expect(result.hash).toBeTruthy();
      expect(result.salt).toBeTruthy();
      expect(result.hash).not.toBe(pin);
    });

    test('should create different hashes for same PIN with different salts', async () => {
      const pin = '1234';
      const result1 = await hashPin(pin);
      const result2 = await hashPin(pin);

      expect(result1.hash).not.toBe(result2.hash);
      expect(result1.salt).not.toBe(result2.salt);
    });

    test('should create consistent hash with same salt', async () => {
      const pin = '1234';
      const result1 = await hashPin(pin);

      // Convert salt back to Uint8Array
      const saltArray = new Uint8Array(
        result1.salt.match(/.{2}/g).map(byte => parseInt(byte, 16))
      );

      // Hash again with same salt
      const result2 = await hashPin(pin, saltArray);

      expect(result2.hash).toBe(result1.hash);
      expect(result2.salt).toBe(result1.salt);
    });

    test('should handle different PIN lengths', async () => {
      const pins = ['1', '12', '123', '1234', '12345', '123456', '1234567', '12345678'];

      for (const pin of pins) {
        const result = await hashPin(pin);
        expect(result.hash).toBeTruthy();
        expect(result.salt).toBeTruthy();
        expect(result.hash.length).toBe(64); // 256 bits = 64 hex chars
        expect(result.salt.length).toBe(32); // 16 bytes = 32 hex chars
      }
    });

    test('should use provided salt when given', async () => {
      const pin = '1234';
      const customSalt = generateSalt();
      const result = await hashPin(pin, customSalt);

      // Convert result salt back to verify it matches
      const resultSaltArray = new Uint8Array(
        result.salt.match(/.{2}/g).map(byte => parseInt(byte, 16))
      );

      expect(resultSaltArray).toEqual(customSalt);
    });

    test('should produce 64-character hex hash (256 bits)', async () => {
      const result = await hashPin('1234');
      expect(result.hash).toMatch(/^[0-9a-f]{64}$/);
    });

    test('should produce 32-character hex salt (16 bytes)', async () => {
      const result = await hashPin('1234');
      expect(result.salt).toMatch(/^[0-9a-f]{32}$/);
    });

    test('should handle empty string PIN', async () => {
      const result = await hashPin('');
      expect(result.hash).toBeTruthy();
      expect(result.salt).toBeTruthy();
    });

    test('should handle special characters in PIN', async () => {
      const pins = ['!@#$', 'π≈∞', '🔒🔑', 'abc-123_XYZ'];

      for (const pin of pins) {
        const result = await hashPin(pin);
        expect(result.hash).toBeTruthy();
        expect(result.salt).toBeTruthy();
      }
    });

    test('should handle unicode characters', async () => {
      const result = await hashPin('密码🔐');
      expect(result.hash).toBeTruthy();
      expect(result.salt).toBeTruthy();
    });
  });

  describe('verifyPin', () => {
    test('should verify correct PIN', async () => {
      const pin = '1234';
      const { hash, salt } = await hashPin(pin);

      const isValid = await verifyPin(pin, hash, salt);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect PIN', async () => {
      const pin = '1234';
      const { hash, salt } = await hashPin(pin);

      const isValid = await verifyPin('5678', hash, salt);
      expect(isValid).toBe(false);
    });

    test('should reject empty PIN when original was not empty', async () => {
      const pin = '1234';
      const { hash, salt } = await hashPin(pin);

      const isValid = await verifyPin('', hash, salt);
      expect(isValid).toBe(false);
    });

    test('should reject PIN with extra digits', async () => {
      const pin = '1234';
      const { hash, salt } = await hashPin(pin);

      const isValid = await verifyPin('12345', hash, salt);
      expect(isValid).toBe(false);
    });

    test('should reject PIN with fewer digits', async () => {
      const pin = '1234';
      const { hash, salt } = await hashPin(pin);

      const isValid = await verifyPin('123', hash, salt);
      expect(isValid).toBe(false);
    });

    test('should handle special characters in PIN verification', async () => {
      const pin = '!@#$%^&*';
      const { hash, salt } = await hashPin(pin);

      const isValidCorrect = await verifyPin(pin, hash, salt);
      const isValidWrong = await verifyPin('12345678', hash, salt);

      expect(isValidCorrect).toBe(true);
      expect(isValidWrong).toBe(false);
    });

    test('should handle unicode characters in verification', async () => {
      const pin = '密码🔐';
      const { hash, salt } = await hashPin(pin);

      const isValidCorrect = await verifyPin(pin, hash, salt);
      const isValidWrong = await verifyPin('1234', hash, salt);

      expect(isValidCorrect).toBe(true);
      expect(isValidWrong).toBe(false);
    });

    test('should return false for invalid salt format', async () => {
      const pin = '1234';
      const { hash } = await hashPin(pin);

      const isValid = await verifyPin(pin, hash, 'invalid_salt');
      expect(isValid).toBe(false);
    });

    test('should return false for invalid hash format', async () => {
      const pin = '1234';
      const { salt } = await hashPin(pin);

      const isValid = await verifyPin(pin, 'invalid_hash', salt);
      expect(isValid).toBe(false);
    });

    test('should be case-sensitive', async () => {
      const pin = 'AbCd';
      const { hash, salt } = await hashPin(pin);

      const isValidCorrect = await verifyPin('AbCd', hash, salt);
      const isValidWrong = await verifyPin('abcd', hash, salt);

      expect(isValidCorrect).toBe(true);
      expect(isValidWrong).toBe(false);
    });
  });

  describe('migratePlaintextPin', () => {
    test('should migrate valid plaintext PIN', async () => {
      const result = await migratePlaintextPin('1234');

      expect(result).toHaveProperty('hash');
      expect(result).toHaveProperty('salt');
      expect(result.hash).toBeTruthy();
      expect(result.salt).toBeTruthy();
    });

    test('should reject PIN shorter than 4 characters', async () => {
      await expect(migratePlaintextPin('123')).rejects.toThrow('Invalid PIN for migration');
    });

    test('should reject empty PIN', async () => {
      await expect(migratePlaintextPin('')).rejects.toThrow('Invalid PIN for migration');
    });

    test('should reject null PIN', async () => {
      await expect(migratePlaintextPin(null)).rejects.toThrow('Invalid PIN for migration');
    });

    test('should migrate 4-digit PIN successfully', async () => {
      const result = await migratePlaintextPin('5678');
      const isValid = await verifyPin('5678', result.hash, result.salt);
      expect(isValid).toBe(true);
    });

    test('should migrate longer PINs', async () => {
      const longPin = '12345678';
      const result = await migratePlaintextPin(longPin);
      const isValid = await verifyPin(longPin, result.hash, result.salt);
      expect(isValid).toBe(true);
    });
  });

  describe('Performance', () => {
    test('should hash PIN in reasonable time (<1000ms)', async () => {
      const pin = '1234';
      const start = Date.now();

      await hashPin(pin);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });

    test('should verify PIN in reasonable time (<1000ms)', async () => {
      const pin = '1234';
      const { hash, salt } = await hashPin(pin);

      const start = Date.now();
      await verifyPin(pin, hash, salt);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Security Properties', () => {
    test('should produce different hashes for different PINs', async () => {
      const pin1 = '1234';
      const pin2 = '5678';

      // Use same salt for both to isolate PIN difference
      const salt = generateSalt();
      const result1 = await hashPin(pin1, salt);
      const result2 = await hashPin(pin2, salt);

      expect(result1.hash).not.toBe(result2.hash);
    });

    test('should not reverse PIN from hash', async () => {
      const pin = '1234';
      const { hash } = await hashPin(pin);

      // Hash should not contain the PIN
      expect(hash).not.toContain(pin);
      expect(hash.toLowerCase()).not.toContain(pin);
    });

    test('should use sufficient hash length for security', async () => {
      const { hash } = await hashPin('1234');
      // 256 bits = 64 hex characters
      expect(hash.length).toBe(64);
    });

    test('should use sufficient salt length for security', async () => {
      const { salt } = await hashPin('1234');
      // 16 bytes = 32 hex characters (128 bits)
      expect(salt.length).toBe(32);
    });
  });
});
