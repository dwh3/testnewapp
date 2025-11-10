// Mock localStorage for tests
import 'jest-localstorage-mock';
import '@testing-library/jest-dom';

// Mock Web Crypto API (Node doesn't have it natively in the same way as browsers)
import { webcrypto } from 'crypto';
import { TextEncoder, TextDecoder } from 'util';

// Set up crypto for ES6 modules and jsdom
// Note: In Node.js, globalThis.crypto is a getter, so we need to use Object.defineProperty
const cryptoPolyfill = {
  getRandomValues: webcrypto.getRandomValues.bind(webcrypto),
  subtle: webcrypto.subtle,
  randomUUID: webcrypto.randomUUID.bind(webcrypto)
};

// Override the read-only crypto property on globalThis
Object.defineProperty(globalThis, 'crypto', {
  value: cryptoPolyfill,
  writable: true,
  configurable: true
});

// Also set on global for compatibility
global.crypto = cryptoPolyfill;

// For jsdom environment
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'crypto', {
    value: cryptoPolyfill,
    writable: true,
    configurable: true
  });
}

// Text encoding
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});
