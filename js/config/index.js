/**
 * Configuration loader
 * Detects environment and loads appropriate config
 */

/**
 * Deep merge two objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object to merge
 * @returns {Object} Merged object
 */
function deepMerge(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}

// Detect environment (default to production for safety)
// Check multiple methods for environment detection
let ENV = 'production'; // Safe default

// Method 1: Check URL hostname (localhost = development)
if (typeof window !== 'undefined' && window.location) {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
    ENV = 'development';
  }
}

// Method 2: Check for Node.js environment variable (for testing)
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
  ENV = process.env.NODE_ENV;
}

// Method 3: Allow manual override via query parameter (?env=development)
if (typeof window !== 'undefined' && window.location && window.location.search) {
  const params = new URLSearchParams(window.location.search);
  if (params.has('env')) {
    ENV = params.get('env');
  }
}

// Load base config
let config = deepMerge({}, defaultConfig);

// Override with environment-specific config
if (ENV === 'development' && typeof developmentConfig !== 'undefined') {
  config = deepMerge(config, developmentConfig);
} else if (ENV === 'production' && typeof productionConfig !== 'undefined') {
  config = deepMerge(config, productionConfig);
}

// Add environment to config
config.environment = ENV;

// Freeze config to prevent runtime modifications
Object.freeze(config);

/**
 * Check if a feature is enabled
 * @param {string} featureName - Name of the feature flag
 * @returns {boolean} True if feature is enabled
 */
function isFeatureEnabled(featureName) {
  return config.features && config.features[featureName] === true;
}

/**
 * Get configuration value by path
 * @param {string} path - Dot-separated path (e.g., 'security.pinHashIterations')
 * @returns {*} Configuration value or null
 */
function getConfigValue(path) {
  const keys = path.split('.');
  let value = config;

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return null;
  }

  return value;
}

/**
 * Get current environment
 * @returns {string} 'development' or 'production'
 */
function getEnvironment() {
  return ENV;
}

/**
 * Get entire configuration object (read-only)
 * @returns {Object} Configuration object
 */
function getConfig() {
  return config;
}

// Log environment on load (only in console if enabled)
if (typeof console !== 'undefined' && config.logging.enableConsole) {
  console.log(`[Config] Environment: ${ENV}`);
  console.log(`[Config] Loaded configuration:`, config);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports.config = config;
  module.exports.isFeatureEnabled = isFeatureEnabled;
  module.exports.getConfigValue = getConfigValue;
  module.exports.getEnvironment = getEnvironment;
  module.exports.getConfig = getConfig;
}
