/**
 * Development environment configuration overrides
 * Used during local development and testing
 */

const developmentConfig = {
  // Enable all features in development
  features: {
    enableDataExport: true,
    enableDataImport: true,         // Test incomplete features
    enableCustomExercises: true,    // Test incomplete features
    enableEditEntries: true,        // Test incomplete features
    enableDeleteEntries: true,      // Test incomplete features
    enableSocialSharing: false,
    enableOfflineMode: true,
    enablePerExerciseHistory: true  // Test incomplete features
  },

  // More verbose logging in dev
  logging: {
    level: 'debug',
    enableConsole: true,
    enableStorage: true,
    maxLogEntries: 500
  },

  // Shorter timeouts for faster testing
  security: {
    pinHashIterations: 100000,
    sessionTimeout: 60,             // Longer timeout in dev
    maxLoginAttempts: 10,           // More lenient
    lockoutDuration: 1              // Shorter lockout
  },

  // Performance settings for dev
  performance: {
    lazyLoadImages: false,          // Load all images immediately
    debounceDelay: 100,             // Faster response
    cacheTimeout: 60                // Shorter cache
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports.developmentConfig = developmentConfig;
}
