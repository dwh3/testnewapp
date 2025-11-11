# Configuration Management Guide

## Overview

FitTrack PWA uses a hierarchical configuration system to manage settings across different environments and control feature visibility through feature flags.

**Configuration Hierarchy:**
1. `js/config/default.js` - Base configuration with all defaults
2. `js/config/development.js` or `js/config/production.js` - Environment-specific overrides
3. `js/config/index.js` - Configuration loader and utility functions

## Table of Contents

- [Environment Detection](#environment-detection)
- [Configuration Files](#configuration-files)
- [Feature Flags](#feature-flags)
- [Configuration Sections](#configuration-sections)
- [Usage Examples](#usage-examples)
- [Modifying Configuration](#modifying-configuration)
- [Security Considerations](#security-considerations)
- [Best Practices](#best-practices)

---

## Environment Detection

The configuration system automatically detects the environment using multiple methods:

### Detection Methods (in order of precedence)

1. **URL Query Parameter**: `?env=development` or `?env=production`
   - Highest priority
   - Useful for testing production config locally

2. **Node.js Environment Variable**: `process.env.NODE_ENV`
   - Used during testing with Jest
   - Set via `.env` file or command line

3. **Hostname Detection**:
   - `localhost`, `127.0.0.1`, or empty hostname → `development`
   - All other hostnames → `production`
   - Default fallback for browser environments

### Current Environment

Check the current environment:

```javascript
const env = getEnvironment();
console.log(env); // 'development' or 'production'
```

---

## Configuration Files

### js/config/default.js

**Purpose:** Contains all base configuration values used across all environments.

**Sections:**
- `app` - Application metadata (name, version, build date)
- `features` - Feature flags controlling feature visibility
- `storage` - localStorage settings and retention policies
- `security` - PIN hashing, session timeouts, authentication settings
- `ui` - User interface preferences (theme, units, formats)
- `charts` - Chart.js visualization settings
- `workout` - Workout tracking defaults
- `nutrition` - Nutrition tracking defaults
- `logging` - Application logging configuration
- `performance` - Performance optimization settings

**Key Principle:** All configuration options must be defined here with sensible defaults.

### js/config/development.js

**Purpose:** Overrides for local development and testing.

**Key Differences from Default:**
- All features enabled (including incomplete ones)
- Verbose logging (`level: 'debug'`)
- Relaxed security (longer session timeout, more login attempts)
- Faster testing (shorter debounce delays, no lazy loading)

**When Used:**
- Running on `localhost` or `127.0.0.1`
- `NODE_ENV=development` in testing
- `?env=development` query parameter

### js/config/production.js

**Purpose:** Overrides for deployed/live environment.

**Key Differences from Default:**
- Only complete features enabled
- Minimal logging (`level: 'error'`, console disabled)
- Strict security (shorter session timeout, fewer login attempts)
- Optimized performance (lazy loading, longer cache timeouts)

**When Used:**
- Running on any non-localhost domain
- `NODE_ENV=production`
- Default if no other detection method applies

### js/config/index.js

**Purpose:** Configuration loader with utility functions.

**Responsibilities:**
1. Detect current environment
2. Load and deep-merge configuration objects
3. Freeze configuration to prevent modifications
4. Provide utility functions for accessing configuration

**Exported Functions:**
- `config` - Full configuration object (read-only)
- `isFeatureEnabled(featureName)` - Check if feature is enabled
- `getConfigValue(path)` - Get value by dot-notation path
- `getEnvironment()` - Get current environment string
- `getConfig()` - Get entire config object

---

## Feature Flags

Feature flags control which features are visible and enabled in the application. This allows incomplete or experimental features to be hidden in production while remaining accessible in development.

### Available Feature Flags

| Feature Flag | Status | Default (Prod) | Default (Dev) | Purpose |
|--------------|--------|----------------|---------------|---------|
| `enableDataExport` | ✅ Complete | `true` | `true` | Export workout/nutrition data to JSON |
| `enableDataImport` | ⚠️ Incomplete | `false` | `true` | Import data from JSON files |
| `enableCustomExercises` | ⚠️ Incomplete | `false` | `true` | Create custom exercises |
| `enableEditEntries` | ⚠️ Incomplete | `false` | `true` | Edit existing workout/meal entries |
| `enableDeleteEntries` | ⚠️ Incomplete | `false` | `true` | Delete workout/meal entries |
| `enableSocialSharing` | 🔮 Future | `false` | `false` | Share progress on social media |
| `enableOfflineMode` | ✅ Complete | `true` | `true` | PWA offline functionality |
| `enablePerExerciseHistory` | ⚠️ Incomplete | `false` | `true` | Per-exercise progress charts |

### Feature Flag Usage

**Check if feature is enabled:**

```javascript
if (isFeatureEnabled('enableDataExport')) {
  // Show export button
  document.getElementById('exportButton').style.display = 'block';
} else {
  // Hide export button
  document.getElementById('exportButton').style.display = 'none';
}
```

**Example: Conditionally render UI elements:**

```javascript
// Hide incomplete features in production
if (!isFeatureEnabled('enableCustomExercises')) {
  const customExerciseBtn = document.getElementById('customExerciseBtn');
  if (customExerciseBtn) {
    customExerciseBtn.remove();
  }
}
```

---

## Configuration Sections

### App Metadata

```javascript
config.app = {
  name: 'Fitness Tracker',
  version: '1.1.0',
  buildDate: '2025-11-11'
}
```

**Usage:**
```javascript
const appName = getConfigValue('app.name');
const version = getConfigValue('app.version');
```

### Storage Configuration

```javascript
config.storage = {
  keyPrefix: 'fitness_',
  maxWorkoutHistory: 365,      // Days
  maxNutritionHistory: 90,     // Days
  maxMealHistory: 90,          // Days
  autoBackupInterval: 7,       // Days
  compressionEnabled: false
}
```

**Usage:**
```javascript
const prefix = getConfigValue('storage.keyPrefix');
const maxHistory = getConfigValue('storage.maxWorkoutHistory');
```

### Security Settings

```javascript
config.security = {
  pinHashIterations: 100000,   // PBKDF2 iterations (OWASP recommended)
  sessionTimeout: 30,          // Minutes (15 in production)
  maxLoginAttempts: 5,         // Attempts (3 in production)
  lockoutDuration: 15          // Minutes (30 in production)
}
```

**Usage:**
```javascript
const iterations = getConfigValue('security.pinHashIterations');
const timeout = getConfigValue('security.sessionTimeout');
```

### UI Preferences

```javascript
config.ui = {
  theme: 'light',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  weightUnit: 'lbs',
  distanceUnit: 'miles',
  firstDayOfWeek: 'sunday',
  animationsEnabled: true
}
```

**Usage:**
```javascript
const theme = getConfigValue('ui.theme');
const weightUnit = getConfigValue('ui.weightUnit');
```

### Chart Configuration

```javascript
config.charts = {
  defaultPeriod: 30,           // Days
  animationDuration: 500,      // Milliseconds
  colors: {
    primary: '#007bff',
    success: '#28a745',
    // ...
  },
  gridLines: {
    display: true,
    color: 'rgba(0,0,0,0.1)'
  }
}
```

**Usage:**
```javascript
const chartColors = getConfigValue('charts.colors');
const period = getConfigValue('charts.defaultPeriod');
```

### Workout Defaults

```javascript
config.workout = {
  defaultRestTime: 60,         // Seconds
  autoSaveInterval: 30,        // Seconds
  vibrationEnabled: true,
  soundEnabled: false,
  keepScreenOn: true
}
```

### Nutrition Defaults

```javascript
config.nutrition = {
  dailyCalorieGoal: 2000,
  proteinGoal: 150,            // Grams
  carbGoal: 200,               // Grams
  fatGoal: 65,                 // Grams
  trackWater: true,
  waterGoal: 64                // Ounces
}
```

### Logging Configuration

```javascript
config.logging = {
  level: 'info',               // 'error', 'warn', 'info', 'debug'
  enableConsole: true,         // false in production
  enableStorage: false,
  maxLogEntries: 100
}
```

### Performance Settings

```javascript
config.performance = {
  lazyLoadImages: true,
  debounceDelay: 300,          // Milliseconds
  cacheTimeout: 3600           // Seconds
}
```

---

## Usage Examples

### Example 1: Check Feature Flag Before Rendering

```javascript
// In HTML/JavaScript for rendering UI
document.addEventListener('DOMContentLoaded', function() {
  // Hide data import if not enabled
  if (!isFeatureEnabled('enableDataImport')) {
    const importBtn = document.getElementById('importDataBtn');
    if (importBtn) importBtn.style.display = 'none';
  }

  // Show custom exercise creator only if enabled
  if (isFeatureEnabled('enableCustomExercises')) {
    const customSection = document.getElementById('customExerciseSection');
    if (customSection) customSection.style.display = 'block';
  }
});
```

### Example 2: Use Security Settings

```javascript
// In crypto.js for PIN hashing
async function hashPin(pin, salt) {
  const iterations = getConfigValue('security.pinHashIterations');
  // Use iterations in PBKDF2...
}

// In session management
function checkSessionTimeout() {
  const timeoutMinutes = getConfigValue('security.sessionTimeout');
  const lastActivity = localStorage.getItem('lastActivity');
  const now = Date.now();

  if (now - lastActivity > timeoutMinutes * 60 * 1000) {
    // Session expired, redirect to login
    window.location.href = 'login.html';
  }
}
```

### Example 3: Use Chart Configuration

```javascript
// In chart initialization
function createProgressChart(data) {
  const colors = getConfigValue('charts.colors');
  const period = getConfigValue('charts.defaultPeriod');
  const animationDuration = getConfigValue('charts.animationDuration');

  new Chart(ctx, {
    type: 'line',
    data: {
      // Filter data to show only last N days
      datasets: [{
        data: data.slice(-period),
        borderColor: colors.primary,
        backgroundColor: colors.primary + '20' // Add alpha
      }]
    },
    options: {
      animation: {
        duration: animationDuration
      },
      scales: {
        x: {
          grid: getConfigValue('charts.gridLines')
        }
      }
    }
  });
}
```

### Example 4: Environment-Specific Behavior

```javascript
// Different behavior in development vs production
const env = getEnvironment();

if (env === 'development') {
  console.log('Running in development mode - all features enabled');
  console.log('Current config:', getConfig());
} else {
  // Production - minimal logging
  console.log('Production mode');
}
```

### Example 5: Get Nested Configuration Values

```javascript
// Get nested values using dot notation
const pinIterations = getConfigValue('security.pinHashIterations');
const primaryColor = getConfigValue('charts.colors.primary');
const weightUnit = getConfigValue('ui.weightUnit');
const logLevel = getConfigValue('logging.level');

// Returns null if path doesn't exist
const nonExistent = getConfigValue('foo.bar.baz'); // null
```

---

## Modifying Configuration

### Adding a New Feature Flag

1. **Add to `default.js`:**
   ```javascript
   features: {
     // ...existing flags
     enableNewFeature: false  // Conservative default
   }
   ```

2. **Override in `development.js` if needed:**
   ```javascript
   features: {
     enableNewFeature: true  // Enable for testing
   }
   ```

3. **Keep disabled in `production.js`** until feature is complete

4. **Use in code:**
   ```javascript
   if (isFeatureEnabled('enableNewFeature')) {
     // Show/enable feature
   }
   ```

5. **Document in this file** (update Feature Flags table)

### Adding a New Configuration Section

1. **Add to `default.js`:**
   ```javascript
   newSection: {
     option1: 'value1',
     option2: 42,
     subsection: {
       nestedOption: true
     }
   }
   ```

2. **Add overrides to environment files if needed**

3. **Use in code:**
   ```javascript
   const value = getConfigValue('newSection.option1');
   ```

4. **Document in CONFIG.md** (add to Configuration Sections)

### Changing Default Values

1. Edit `js/config/default.js`
2. Update any environment-specific overrides if needed
3. Test in both development and production modes
4. Update documentation

**Warning:** Changing security-related defaults may have security implications. Review carefully.

---

## Security Considerations

### ⚠️ Important Security Notes

1. **Never Store Secrets in Config Files**
   - Configuration files are client-side and visible to users
   - Don't store API keys, tokens, or passwords
   - Use environment variables for sensitive data (server-side only)

2. **Configuration is Read-Only**
   - Config object is frozen with `Object.freeze()`
   - Cannot be modified at runtime
   - Prevents accidental or malicious tampering

3. **Feature Flags Don't Replace Authentication**
   - Feature flags only control UI visibility
   - Don't rely on them for access control
   - Implement proper authorization checks

4. **Security Settings Defaults**
   - Default to more secure options (shorter timeouts, fewer attempts)
   - Production mode increases security strictness
   - Don't lower security settings without careful consideration

5. **Environment Detection**
   - Production is the safe default
   - Hostname-based detection prevents accidental development mode in production
   - Query parameter override useful for testing but doesn't reduce security

### Recommended Security Practices

- Review security settings before each release
- Test with production configuration locally: `?env=production`
- Monitor for unexpected environment detection
- Keep PIN hash iterations at OWASP minimum (100,000)
- Regularly review and update dependency policies

---

## Best Practices

### For Developers

1. **Test with Both Environments**
   ```bash
   # Test development config (default on localhost)
   open http://localhost:8080

   # Test production config locally
   open http://localhost:8080?env=production
   ```

2. **Use Feature Flags for Incomplete Features**
   - Disable in production until feature is complete
   - Enable in development for testing
   - Remove flag once feature is stable

3. **Document All Configuration Options**
   - Add comments in `default.js`
   - Update CONFIG.md when adding new options
   - Include units (seconds, minutes, days, etc.)

4. **Use Sensible Defaults**
   - Default to safer/more conservative options
   - Consider user experience
   - Follow industry standards (e.g., OWASP for security)

5. **Validate Configuration on Load**
   - Check for required values
   - Validate types and ranges
   - Log warnings for unusual configurations

### For Feature Development

1. **Start with Feature Flag Disabled**
   ```javascript
   features: {
     enableNewFeature: false  // Default to disabled
   }
   ```

2. **Enable in Development for Testing**
   ```javascript
   // development.js
   features: {
     enableNewFeature: true  // Enable for testing
   }
   ```

3. **Keep Disabled in Production Until Complete**
   ```javascript
   // production.js
   features: {
     enableNewFeature: false  // Keep disabled
   }
   ```

4. **Remove Flag When Feature is Stable**
   - Once feature is complete and tested
   - Remove conditional logic
   - Clean up configuration

### Code Review Checklist

When reviewing configuration changes:

- [ ] All new options added to `default.js`
- [ ] Sensible defaults chosen
- [ ] Environment-specific overrides appropriate
- [ ] Documentation updated (CONFIG.md)
- [ ] No sensitive data in config files
- [ ] Security implications considered
- [ ] Tested in both development and production modes
- [ ] Comments added for unclear options

---

## Troubleshooting

### Configuration Not Loading

**Symptoms:** Errors like `isFeatureEnabled is not defined`

**Solutions:**
1. Ensure scripts loaded in correct order in HTML:
   ```html
   <script src="js/config/default.js"></script>
   <script src="js/config/development.js"></script>
   <script src="js/config/production.js"></script>
   <script src="js/config/index.js"></script>
   ```

2. Check browser console for script loading errors

### Wrong Environment Detected

**Symptoms:** Development features showing in production (or vice versa)

**Solutions:**
1. Check `getEnvironment()` output in console
2. Verify hostname detection logic
3. Check for `?env=` query parameter
4. Review environment detection in `js/config/index.js`

### Feature Flag Not Working

**Symptoms:** Feature showing when it should be hidden (or vice versa)

**Solutions:**
1. Verify feature flag name matches exactly
2. Check feature flag value: `isFeatureEnabled('featureName')`
3. Ensure environment config loaded properly
4. Check for typos in feature flag checks

### Configuration Values Not Merging

**Symptoms:** Environment-specific overrides not applying

**Solutions:**
1. Check `deepMerge()` function in `index.js`
2. Verify environment-specific config structure matches `default.js`
3. Ensure environment configs are loaded before `index.js`

---

## Migration Notes

### Upgrading to Configuration System

If you're adding this configuration system to an existing app:

1. **Identify Hardcoded Values**
   - Search for magic numbers and strings
   - Look for repeated values across files

2. **Add to Configuration**
   - Add values to appropriate section in `default.js`
   - Choose descriptive names

3. **Replace Hardcoded Values**
   ```javascript
   // Before
   const timeout = 30; // minutes

   // After
   const timeout = getConfigValue('security.sessionTimeout');
   ```

4. **Test Thoroughly**
   - Test all modified functionality
   - Test in both environments
   - Check for regressions

---

## Related Documentation

- [SECURITY.md](SECURITY.md) - Security implementation details
- [ERROR_HANDLING.md](ERROR_HANDLING.md) - Error handling strategy
- [DEPENDENCIES.md](DEPENDENCIES.md) - Dependency management
- [FUNCTIONALITY_STATUS.md](FUNCTIONALITY_STATUS.md) - Feature completion status

---

## Changelog

### Version 1.1.0 (2025-11-11)

- Initial configuration management system
- Added feature flags for incomplete features
- Environment-specific configurations
- Comprehensive documentation

---

## Support

For questions or issues with configuration:
1. Review this documentation
2. Check browser console for errors
3. Verify environment detection
4. Test with `?env=production` query parameter
5. Review related documentation files
