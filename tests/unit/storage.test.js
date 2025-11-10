/**
 * Tests for js/storage.js safe storage wrapper
 * Validates Phase 2.2 error handling implementation
 */

describe('Safe Storage Wrapper', () => {
  let safeSetItem, safeGetItem, safeRemoveItem;
  let saveJSON, loadJSON;
  let getStorageSize, checkStorageHealth, formatStorageSize;
  let testLocalStorage, emergencyCleanup, exportAllData;

  beforeAll(async () => {
    // Dynamic import of ES6 module
    const storageModule = await import('../../js/storage.js');
    safeSetItem = storageModule.safeSetItem;
    safeGetItem = storageModule.safeGetItem;
    safeRemoveItem = storageModule.safeRemoveItem;
    saveJSON = storageModule.saveJSON;
    loadJSON = storageModule.loadJSON;
    getStorageSize = storageModule.getStorageSize;
    checkStorageHealth = storageModule.checkStorageHealth;
    formatStorageSize = storageModule.formatStorageSize;
    testLocalStorage = storageModule.testLocalStorage;
    emergencyCleanup = storageModule.emergencyCleanup;
    exportAllData = storageModule.exportAllData;
  });

  beforeEach(() => {
    localStorage.clear();
  });

  describe('safeGetItem / safeSetItem', () => {
    test('should save and retrieve string', () => {
      const result = safeSetItem('test', 'value');
      expect(result.success).toBe(true);

      const getResult = safeGetItem('test');
      expect(getResult.success).toBe(true);
      expect(getResult.value).toBe('value');
    });

    test('should save and retrieve number as string', () => {
      safeSetItem('number', '42');
      const result = safeGetItem('number');
      expect(result.value).toBe('42');
    });

    test('should return default value for missing key', () => {
      const result = safeGetItem('nonexistent', 'default');
      expect(result.value).toBe('default');
    });

    test('should return null for missing key without default', () => {
      const result = safeGetItem('nonexistent');
      expect(result.value).toBeNull();
    });

    test('should handle empty string values', () => {
      safeSetItem('empty', '');
      const result = safeGetItem('empty');
      expect(result.value).toBe('');
    });

    test('should return success true on successful save', () => {
      const result = safeSetItem('key', 'value');
      expect(result).toHaveProperty('success', true);
    });

    test('should handle very long strings', () => {
      const longString = 'x'.repeat(10000);
      const setResult = safeSetItem('long', longString);
      expect(setResult.success).toBe(true);

      const getResult = safeGetItem('long');
      expect(getResult.value).toBe(longString);
    });
  });

  describe('saveJSON / loadJSON', () => {
    test('should save and load object', () => {
      const obj = { name: 'Test', value: 123, nested: { a: 1 } };
      const saveResult = saveJSON('testObj', obj);
      expect(saveResult.success).toBe(true);

      const loadResult = loadJSON('testObj');
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toEqual(obj);
    });

    test('should save and load array', () => {
      const arr = [1, 2, 3, 'four', { five: 5 }];
      saveJSON('testArr', arr);

      const loadResult = loadJSON('testArr');
      expect(loadResult.data).toEqual(arr);
    });

    test('should return default value for missing JSON key', () => {
      const loadResult = loadJSON('nonexistent', { default: true });
      expect(loadResult.data).toEqual({ default: true });
    });

    test('should return null for missing JSON key without default', () => {
      const loadResult = loadJSON('nonexistent');
      expect(loadResult.data).toBeNull();
    });

    test('should handle corrupted JSON gracefully', () => {
      localStorage.setItem('corrupted', '{invalid json}');

      const result = loadJSON('corrupted', { fallback: true });
      expect(result.success).toBe(false);
      expect(result.data).toEqual({ fallback: true });
      expect(result.error).toBeTruthy();
    });

    test('should handle empty object', () => {
      saveJSON('empty', {});
      const result = loadJSON('empty');
      expect(result.data).toEqual({});
    });

    test('should handle empty array', () => {
      saveJSON('emptyArr', []);
      const result = loadJSON('emptyArr');
      expect(result.data).toEqual([]);
    });

    test('should handle null value', () => {
      saveJSON('nullVal', null);
      const result = loadJSON('nullVal');
      expect(result.data).toBeNull();
    });

    test('should handle boolean values', () => {
      saveJSON('bool', true);
      const result = loadJSON('bool');
      expect(result.data).toBe(true);
    });

    test('should return size on successful save', () => {
      const result = saveJSON('test', { data: 'value' });
      expect(result).toHaveProperty('size');
      expect(result.size).toBeGreaterThan(0);
    });

    test('should handle nested complex objects', () => {
      const complex = {
        users: [
          { id: 1, name: 'Alice', tags: ['admin', 'active'] },
          { id: 2, name: 'Bob', tags: ['user'] }
        ],
        settings: {
          theme: 'dark',
          notifications: { email: true, sms: false }
        }
      };

      saveJSON('complex', complex);
      const result = loadJSON('complex');
      expect(result.data).toEqual(complex);
    });
  });

  describe('safeRemoveItem', () => {
    test('should remove item from storage', () => {
      safeSetItem('toRemove', 'value');
      expect(safeGetItem('toRemove').value).toBe('value');

      const result = safeRemoveItem('toRemove');
      expect(result.success).toBe(true);
      expect(safeGetItem('toRemove').value).toBeNull();
    });

    test('should not throw when removing nonexistent key', () => {
      expect(() => {
        safeRemoveItem('nonexistent');
      }).not.toThrow();
    });

    test('should return success true', () => {
      safeSetItem('key', 'value');
      const result = safeRemoveItem('key');
      expect(result).toHaveProperty('success', true);
    });
  });

  describe('getStorageSize', () => {
    test('should return 0 for empty storage', () => {
      const size = getStorageSize();
      expect(size).toBe(0);
    });

    test('should return non-zero for populated storage', () => {
      safeSetItem('test', 'value');
      const size = getStorageSize();
      expect(size).toBeGreaterThan(0);
    });

    test('should increase with more data', () => {
      const size1 = getStorageSize();

      safeSetItem('key1', 'value1');
      const size2 = getStorageSize();

      safeSetItem('key2', 'value2');
      const size3 = getStorageSize();

      expect(size2).toBeGreaterThan(size1);
      expect(size3).toBeGreaterThan(size2);
    });

    test('should account for both key and value length', () => {
      const shortKey = 'a';
      const longKey = 'very_long_key_name_here';

      safeSetItem(shortKey, 'value');
      const size1 = getStorageSize();

      localStorage.clear();
      safeSetItem(longKey, 'value');
      const size2 = getStorageSize();

      expect(size2).toBeGreaterThan(size1);
    });
  });

  describe('checkStorageHealth', () => {
    test('should return healthy status for small data', () => {
      safeSetItem('small', 'test');

      const health = checkStorageHealth();
      expect(health.status).toBe('healthy');
      expect(health).toHaveProperty('size');
      expect(health).toHaveProperty('percentage');
      expect(health.size).toBeGreaterThan(0);
    });

    test('should return status, size, and percentage', () => {
      const health = checkStorageHealth();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('size');
      expect(health).toHaveProperty('percentage');
      expect(typeof health.status).toBe('string');
      expect(typeof health.size).toBe('number');
      expect(typeof health.percentage).toBe('number');
    });

    test('should calculate percentage', () => {
      const health = checkStorageHealth();
      expect(health.percentage).toBeGreaterThanOrEqual(0);
      expect(health.percentage).toBeLessThanOrEqual(100);
    });

    test('should return integer percentage', () => {
      const health = checkStorageHealth();
      expect(Number.isInteger(health.percentage)).toBe(true);
    });
  });

  describe('formatStorageSize', () => {
    test('should format bytes', () => {
      expect(formatStorageSize(500)).toBe('500 B');
    });

    test('should format kilobytes', () => {
      expect(formatStorageSize(1024)).toBe('1.0 KB');
      expect(formatStorageSize(2048)).toBe('2.0 KB');
      expect(formatStorageSize(1536)).toBe('1.5 KB');
    });

    test('should format megabytes', () => {
      expect(formatStorageSize(1024 * 1024)).toBe('1.00 MB');
      expect(formatStorageSize(2.5 * 1024 * 1024)).toBe('2.50 MB');
    });

    test('should handle zero bytes', () => {
      expect(formatStorageSize(0)).toBe('0 B');
    });

    test('should handle large values', () => {
      const result = formatStorageSize(10 * 1024 * 1024);
      expect(result).toContain('MB');
      expect(result).toContain('10.00');
    });

    test('should round appropriately', () => {
      expect(formatStorageSize(1234)).toBe('1.2 KB');
      expect(formatStorageSize(1234567)).toBe('1.18 MB');
    });
  });

  describe('testLocalStorage', () => {
    test('should return available true when storage works', () => {
      const result = testLocalStorage();
      expect(result.available).toBe(true);
    });

    test('should not leave test data in storage', () => {
      testLocalStorage();
      const testKey = '__fittrack_storage_test__';
      expect(localStorage.getItem(testKey)).toBeNull();
    });

    test('should return object with available property', () => {
      const result = testLocalStorage();
      expect(result).toHaveProperty('available');
      expect(typeof result.available).toBe('boolean');
    });
  });

  describe('emergencyCleanup', () => {
    test('should return cleaned count and freed bytes', () => {
      const result = emergencyCleanup();
      expect(result).toHaveProperty('cleaned');
      expect(result).toHaveProperty('freedBytes');
      expect(typeof result.cleaned).toBe('number');
      expect(typeof result.freedBytes).toBe('number');
    });

    test('should clean seeded template flags', () => {
      safeSetItem('fittrack_seeded_templates_v1_user123', '1');
      safeSetItem('fittrack_seeded_templates_v1_user456', '1');
      safeSetItem('important_data', 'keep this');

      const result = emergencyCleanup();

      expect(safeGetItem('fittrack_seeded_templates_v1_user123').value).toBeNull();
      expect(safeGetItem('fittrack_seeded_templates_v1_user456').value).toBeNull();
      expect(safeGetItem('important_data').value).toBe('keep this');
      expect(result.cleaned).toBeGreaterThan(0);
    });

    test('should free storage space', () => {
      safeSetItem('fittrack_seeded_templates_v1_test', 'x'.repeat(1000));

      const sizeBefore = getStorageSize();
      const result = emergencyCleanup();
      const sizeAfter = getStorageSize();

      expect(sizeAfter).toBeLessThan(sizeBefore);
      expect(result.freedBytes).toBeGreaterThan(0);
    });

    test('should not fail on empty storage', () => {
      expect(() => emergencyCleanup()).not.toThrow();
    });
  });

  describe('exportAllData', () => {
    test('should export all app data', () => {
      saveJSON('fittrack_profiles', [{ id: 1, name: 'Test' }]);
      safeSetItem('fittrack_current_profile', '1');
      saveJSON('fittrack_food_db', [{ name: 'Chicken' }]);

      const result = exportAllData();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('version');
      expect(result.data).toHaveProperty('exportDate');
      expect(result.data).toHaveProperty('profiles');
      expect(result.data).toHaveProperty('currentProfile');
      expect(result.data).toHaveProperty('foodDB');
    });

    test('should include profiles in export', () => {
      const profiles = [
        { id: '1', name: 'User1' },
        { id: '2', name: 'User2' }
      ];
      saveJSON('fittrack_profiles', profiles);

      const result = exportAllData();

      expect(result.data.profiles).toEqual(profiles);
    });

    test('should include current profile ID', () => {
      safeSetItem('fittrack_current_profile', 'user-123');

      const result = exportAllData();

      expect(result.data.currentProfile).toBe('user-123');
    });

    test('should include food database', () => {
      const foods = [{ name: 'Chicken', calories: 165 }];
      saveJSON('fittrack_food_db', foods);

      const result = exportAllData();

      expect(result.data.foodDB).toEqual(foods);
    });

    test('should include export timestamp', () => {
      const result = exportAllData();

      expect(result.data.exportDate).toBeTruthy();
      expect(new Date(result.data.exportDate).getTime()).not.toBeNaN();
    });

    test('should handle empty data gracefully', () => {
      const result = exportAllData();

      expect(result.success).toBe(true);
      expect(result.data.profiles).toEqual([]);
      expect(result.data.foodDB).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    test('should handle QuotaExceededError gracefully', () => {
      // Mock localStorage to throw quota error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      };

      const result = safeSetItem('test', 'value');

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('QuotaExceededError');
      expect(result.error).toContain('Storage full');

      // Restore original
      Storage.prototype.setItem = originalSetItem;
    });

    test('should handle SecurityError gracefully', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        const error = new Error('SecurityError');
        error.name = 'SecurityError';
        throw error;
      };

      const result = safeSetItem('test', 'value');

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('SecurityError');
      expect(result.error).toContain('blocked');

      Storage.prototype.setItem = originalSetItem;
    });

    test('should handle generic storage errors', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error('Unknown storage error');
      };

      const result = safeSetItem('test', 'value');

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();

      Storage.prototype.setItem = originalSetItem;
    });

    test('should handle error logging', () => {
      const originalSetItem = Storage.prototype.setItem;
      const originalConsoleError = console.error;
      let errorCalled = false;

      // Mock console.error
      console.error = () => { errorCalled = true; };

      Storage.prototype.setItem = () => {
        const error = new Error('Test error');
        error.name = 'TestError';
        throw error;
      };

      safeSetItem('test', 'value');

      expect(errorCalled).toBe(true);

      Storage.prototype.setItem = originalSetItem;
      console.error = originalConsoleError;
    });
  });

  describe('Integration Tests', () => {
    test('should handle full workflow: save, load, modify, remove', () => {
      // Save initial data
      const data = { count: 1, items: ['a', 'b'] };
      const saveResult = saveJSON('workflow', data);
      expect(saveResult.success).toBe(true);

      // Load data
      const loadResult = loadJSON('workflow');
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toEqual(data);

      // Modify data
      const modified = { ...loadResult.data, count: 2 };
      saveJSON('workflow', modified);

      // Verify modification
      const loadResult2 = loadJSON('workflow');
      expect(loadResult2.data.count).toBe(2);

      // Remove data
      const removeResult = safeRemoveItem('workflow');
      expect(removeResult.success).toBe(true);

      // Verify removal
      const loadResult3 = loadJSON('workflow');
      expect(loadResult3.data).toBeNull();
    });

    test('should handle multiple concurrent operations', () => {
      saveJSON('item1', { value: 1 });
      saveJSON('item2', { value: 2 });
      saveJSON('item3', { value: 3 });

      expect(loadJSON('item1').data.value).toBe(1);
      expect(loadJSON('item2').data.value).toBe(2);
      expect(loadJSON('item3').data.value).toBe(3);
    });
  });
});
