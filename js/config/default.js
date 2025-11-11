/**
 * Default configuration for Fitness Tracker PWA
 * These values are used unless overridden by environment-specific config
 */

const defaultConfig = {
  // App metadata
  app: {
    name: 'Fitness Tracker',
    version: '1.1.0',
    buildDate: new Date().toISOString().split('T')[0]
  },

  // Feature flags - control which features are visible/enabled
  features: {
    enableDataExport: true,        // Phase 2.2 complete
    enableDataImport: false,       // Not yet implemented
    enableCustomExercises: false,  // Incomplete per audit
    enableEditEntries: false,      // Incomplete per audit
    enableDeleteEntries: false,    // Incomplete per audit
    enableSocialSharing: false,    // Future feature
    enableOfflineMode: true,       // PWA feature
    enablePerExerciseHistory: false // Incomplete per audit
  },

  // Storage configuration
  storage: {
    keyPrefix: 'fitness_',         // Prefix for all localStorage keys
    maxWorkoutHistory: 365,        // Days to keep workout data
    maxNutritionHistory: 90,       // Days to keep nutrition data
    maxMealHistory: 90,            // Days to keep meal data
    autoBackupInterval: 7,         // Days between auto-backups
    compressionEnabled: false      // Future: compress old data
  },

  // Security settings (from Phase 2.1)
  security: {
    pinHashIterations: 100000,     // PBKDF2 iterations (OWASP min)
    sessionTimeout: 30,            // Minutes before re-auth
    maxLoginAttempts: 5,           // Failed attempts before lockout
    lockoutDuration: 15            // Minutes of lockout
  },

  // UI preferences
  ui: {
    theme: 'light',                // 'light' or 'dark'
    dateFormat: 'MM/DD/YYYY',      // Date display format
    timeFormat: '12h',             // '12h' or '24h'
    weightUnit: 'lbs',             // 'lbs' or 'kg'
    distanceUnit: 'miles',         // 'miles' or 'km'
    firstDayOfWeek: 'sunday',      // Week starts on
    animationsEnabled: true        // UI animations
  },

  // Chart configuration (for Chart.js)
  charts: {
    defaultPeriod: 30,             // Days to show by default
    animationDuration: 500,        // MS for chart animations
    colors: {
      primary: '#007bff',
      success: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545',
      info: '#17a2b8',
      secondary: '#6c757d'
    },
    gridLines: {
      display: true,
      color: 'rgba(0,0,0,0.1)'
    }
  },

  // Workout defaults
  workout: {
    defaultRestTime: 60,           // Seconds between sets
    autoSaveInterval: 30,          // Seconds between auto-saves
    vibrationEnabled: true,        // Haptic feedback
    soundEnabled: false,           // Audio feedback
    keepScreenOn: true             // Prevent screen sleep during workout
  },

  // Nutrition defaults
  nutrition: {
    dailyCalorieGoal: 2000,        // Default calorie target
    proteinGoal: 150,              // Grams
    carbGoal: 200,                 // Grams
    fatGoal: 65,                   // Grams
    trackWater: true,              // Enable water tracking
    waterGoal: 64                  // Ounces per day
  },

  // Logging configuration
  logging: {
    level: 'info',                 // 'error', 'warn', 'info', 'debug'
    enableConsole: true,           // Log to browser console
    enableStorage: false,          // Store logs in localStorage
    maxLogEntries: 100             // Max logs to keep
  },

  // Performance optimization
  performance: {
    lazyLoadImages: true,          // Defer image loading
    debounceDelay: 300,            // MS for input debouncing
    cacheTimeout: 3600             // Seconds to cache data
  }
};

// Export for Node.js/CommonJS (for testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports.defaultConfig = defaultConfig;
}
