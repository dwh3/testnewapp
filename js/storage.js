/**
 * LocalStorage wrapper with error handling and quota management
 *
 * Handles common localStorage failures:
 * - QuotaExceededError (storage full)
 * - SecurityError (private browsing, disabled storage)
 * - Browser crashes/corruption
 *
 * @module storage
 */

'use strict';

// Storage size limits (approximate, browser-dependent)
const STORAGE_QUOTA = {
  WARNING_THRESHOLD: 4 * 1024 * 1024,  // 4MB - warn user
  CRITICAL_THRESHOLD: 4.5 * 1024 * 1024 // 4.5MB - critical, cleanup needed
};

/**
 * Get current localStorage usage in bytes (approximate)
 * @returns {number} Bytes used
 */
export function getStorageSize() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += key.length + (localStorage[key]?.length || 0);
    }
  }
  return total * 2; // UTF-16 = 2 bytes per char
}

/**
 * Check if storage is near quota
 * @returns {{status: string, size: number, percentage: number}}
 */
export function checkStorageHealth() {
  const size = getStorageSize();
  const percentage = (size / 5242880) * 100; // 5MB typical limit

  let status = 'healthy';
  if (size >= STORAGE_QUOTA.CRITICAL_THRESHOLD) {
    status = 'critical';
  } else if (size >= STORAGE_QUOTA.WARNING_THRESHOLD) {
    status = 'warning';
  }

  return { status, size, percentage: Math.round(percentage) };
}

/**
 * Safe localStorage.setItem with error handling
 * @param {string} key
 * @param {string} value
 * @returns {{success: boolean, error?: string, errorType?: string}}
 */
export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (err) {
    // Categorize error types
    const errorType = err.name || 'UnknownError';
    let userMessage = 'Failed to save data';

    if (errorType === 'QuotaExceededError') {
      userMessage = 'Storage full! Please export your data or clear old entries.';
    } else if (errorType === 'SecurityError') {
      userMessage = 'Storage blocked by browser (private mode or disabled).';
    } else {
      userMessage = `Storage error: ${err.message}`;
    }

    console.error('LocalStorage save failed:', {
      key,
      error: err.name,
      message: err.message,
      storageSize: getStorageSize()
    });

    return {
      success: false,
      error: userMessage,
      errorType: errorType
    };
  }
}

/**
 * Safe localStorage.getItem with error handling
 * @param {string} key
 * @param {string} [defaultValue=null] - Fallback if key not found
 * @returns {{success: boolean, value: string|null, error?: string}}
 */
export function safeGetItem(key, defaultValue = null) {
  try {
    const value = localStorage.getItem(key);
    return {
      success: true,
      value: value !== null ? value : defaultValue
    };
  } catch (err) {
    console.error('LocalStorage read failed:', {
      key,
      error: err.name,
      message: err.message
    });

    return {
      success: false,
      value: defaultValue,
      error: `Failed to read data: ${err.message}`
    };
  }
}

/**
 * Safe localStorage.removeItem with error handling
 * @param {string} key
 * @returns {{success: boolean, error?: string}}
 */
export function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key);
    return { success: true };
  } catch (err) {
    console.error('LocalStorage remove failed:', {
      key,
      error: err.name,
      message: err.message
    });

    return {
      success: false,
      error: `Failed to remove data: ${err.message}`
    };
  }
}

/**
 * Save JSON data with automatic serialization and error handling
 * @param {string} key
 * @param {any} data - JavaScript object to serialize
 * @returns {{success: boolean, error?: string, errorType?: string, size?: number}}
 */
export function saveJSON(key, data) {
  try {
    const json = JSON.stringify(data);
    const size = (json.length * 2); // UTF-16 bytes

    // Check quota before saving
    const health = checkStorageHealth();
    if (health.status === 'critical') {
      return {
        success: false,
        error: 'Storage critically full. Please export your data.',
        errorType: 'QuotaWarning',
        size
      };
    }

    const result = safeSetItem(key, json);
    if (result.success) {
      return { success: true, size };
    }

    return result;
  } catch (err) {
    // JSON.stringify can fail for circular references or special objects
    console.error('JSON serialization failed:', {
      key,
      error: err.message
    });

    return {
      success: false,
      error: 'Failed to serialize data: ' + err.message,
      errorType: 'SerializationError'
    };
  }
}

/**
 * Load JSON data with automatic parsing and error handling
 * @param {string} key
 * @param {any} [defaultValue=null] - Fallback if key not found or parse fails
 * @returns {{success: boolean, data: any, error?: string}}
 */
export function loadJSON(key, defaultValue = null) {
  const result = safeGetItem(key);

  if (!result.success || result.value === null) {
    return {
      success: false,
      data: defaultValue,
      error: result.error
    };
  }

  try {
    const data = JSON.parse(result.value);
    return { success: true, data };
  } catch (err) {
    console.error('JSON parse failed:', {
      key,
      error: err.message,
      dataPreview: result.value?.substring(0, 100)
    });

    return {
      success: false,
      data: defaultValue,
      error: 'Data corrupted or invalid format'
    };
  }
}

/**
 * Test if localStorage is available and writable
 * @returns {{available: boolean, error?: string}}
 */
export function testLocalStorage() {
  const testKey = '__fittrack_storage_test__';
  const testValue = 'test';

  try {
    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);

    if (retrieved !== testValue) {
      return {
        available: false,
        error: 'Storage read/write mismatch'
      };
    }

    return { available: true };
  } catch (err) {
    return {
      available: false,
      error: err.name === 'SecurityError'
        ? 'Storage disabled (private browsing or blocked)'
        : `Storage unavailable: ${err.message}`
    };
  }
}

/**
 * Clean up old data to free space (aggressive cleanup)
 * @returns {{cleaned: number, freedBytes: number}}
 */
export function emergencyCleanup() {
  const beforeSize = getStorageSize();
  let cleaned = 0;

  // List of non-essential keys that can be cleaned
  const cleanableKeys = [
    'fittrack_foods_seeded',
    'fittrack_seeded_templates_v1_', // Pattern, actual keys vary
  ];

  // Clean exact match keys
  cleanableKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      cleaned++;
    }
  });

  // Clean pattern-matched keys (template seeding flags)
  for (let key in localStorage) {
    if (key.startsWith('fittrack_seeded_templates_v1_')) {
      localStorage.removeItem(key);
      cleaned++;
    }
  }

  const afterSize = getStorageSize();
  const freedBytes = beforeSize - afterSize;

  console.log('Emergency cleanup:', {
    cleaned,
    freedBytes,
    beforeSize,
    afterSize
  });

  return { cleaned, freedBytes };
}

/**
 * Get human-readable storage size
 * @param {number} bytes
 * @returns {string} e.g., "2.5 MB"
 */
export function formatStorageSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Export all app data as downloadable JSON
 * (For user data backup before cleanup)
 * @returns {{success: boolean, data?: any, error?: string}}
 */
export function exportAllData() {
  try {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      profiles: loadJSON('fittrack_profiles', []).data,
      currentProfile: safeGetItem('fittrack_current_profile').value,
      foodDB: loadJSON('fittrack_food_db', []).data
    };

    return { success: true, data: exportData };
  } catch (err) {
    return {
      success: false,
      error: 'Export failed: ' + err.message
    };
  }
}
