// Mock localStorage for tests
import 'jest-localstorage-mock';
import '@testing-library/jest-dom';

// Mock Web Crypto API (Node doesn't have it natively in the same way as browsers)
import { webcrypto } from 'crypto';
import { TextEncoder, TextDecoder } from 'util';

// Set up global crypto and text encoding
// Webcrypto includes both getRandomValues and subtle
global.crypto = {
  getRandomValues: webcrypto.getRandomValues.bind(webcrypto),
  subtle: webcrypto.subtle,
  randomUUID: webcrypto.randomUUID.bind(webcrypto)
};

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});
