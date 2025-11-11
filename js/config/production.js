/**
 * Production environment configuration overrides
 * Used in deployed/live environment
 */

const productionConfig = {
  // Only enable complete features in production
  features: {
    enableDataExport: true,         // Phase 2.2 complete
    enableDataImport: false,        // Not ready
    enableCustomExercises: false,   // Not ready
    enableEditEntries: false,       // Not ready
    enableDeleteEntries: false,     // Not ready
    enableSocialSharing: false,
    enableOfflineMode: true,
    enablePerExerciseHistory: false // Not ready
  },

  // Minimal logging in production
  logging: {
    level: 'error',                 // Only errors
    enableConsole: false,           // No console logs
    enableStorage: false,           // Don't store logs
    maxLogEntries: 50
  },

  // Stricter security in production
  security: {
    pinHashIterations: 100000,
    sessionTimeout: 15,             // Shorter timeout
    maxLoginAttempts: 3,            // Stricter
    lockoutDuration: 30             // Longer lockout
  },

  // Optimized performance
  performance: {
    lazyLoadImages: true,
    debounceDelay: 300,
    cacheTimeout: 3600
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports.productionConfig = productionConfig;
}
