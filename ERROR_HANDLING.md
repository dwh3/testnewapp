# Error Handling Documentation

**Version:** 1.0
**Last Updated:** 2025-11-10

---

## Overview

This document describes the error handling approach for FitTrack's data persistence layer, specifically addressing localStorage failures and data corruption scenarios.

## Storage Error Types

### 1. QuotaExceededError

**Cause:** localStorage limit reached (typically 5-10MB depending on browser)

**Detection:**
```javascript
try {
  localStorage.setItem(key, value);
} catch (err) {
  if (err.name === 'QuotaExceededError') {
    // Handle quota exceeded
  }
}
```

**Handling Strategy:**
1. **Immediate**: Show user-friendly error message with storage usage
2. **Action**: Suggest data export and cleanup
3. **Fallback**: Use in-memory storage for current session
4. **Recovery**: Offer emergency cleanup option

**User Message:**
```
"Storage full (4.2MB used, ~84%). Please export and clear old workout/nutrition data."
```

**Implementation:** `js/storage.js:66-88`

---

### 2. SecurityError

**Cause:** localStorage disabled or blocked
- Private/Incognito browsing mode
- Browser security settings
- Third-party cookie blocking
- Corporate policy restrictions

**Detection:**
```javascript
try {
  localStorage.setItem('__test__', 'test');
  localStorage.removeItem('__test__');
} catch (err) {
  if (err.name === 'SecurityError') {
    // Storage disabled
  }
}
```

**Handling Strategy:**
1. **Immediate**: Detect on app load via `testLocalStorage()`
2. **Fallback**: Switch to in-memory `Map` storage automatically
3. **Warning**: Notify user data won't persist across sessions
4. **Guidance**: Suggest enabling storage or using normal browsing mode

**User Message:**
```
"Browser security settings prevent saving data. Check privacy/incognito mode. Data will only persist for this session."
```

**Implementation:** `js/storage.js:245-272`

---

### 3. Corrupted Data / JSON Parse Errors

**Cause:** Invalid JSON in localStorage
- Incomplete writes
- Browser crashes during save
- Manual localStorage editing
- Extension interference

**Detection:**
```javascript
try {
  const data = JSON.parse(localStorage.getItem(key));
} catch (err) {
  // Corrupted JSON
}
```

**Handling Strategy:**
1. **Non-destructive**: DO NOT delete corrupted data immediately
2. **Fallback**: Return default/empty values
3. **Logging**: Log error with data preview for debugging
4. **Recovery**: Allow manual recovery via settings

**User Message:**
```
"Data corrupted or invalid format. Using default values. Your data is preserved for manual recovery."
```

**Implementation:** `js/storage.js:183-206`

---

### 4. Unexpected Errors

**Cause:** Unknown browser issues, extensions, permissions

**Handling Strategy:**
1. **Catch-all**: Wrap all localStorage ops in try-catch
2. **Logging**: Console.error with full context
3. **Graceful degradation**: Return defaults, don't crash
4. **User feedback**: Generic error message

**User Message:**
```
"Unable to save data. Please try again or check browser settings."
```

---

## Safe Storage API

### Core Functions

#### `safeSetItem(key, value)`
**Purpose:** Safe wrapper for localStorage.setItem

**Returns:**
```javascript
{
  success: boolean,
  error?: string,
  errorType?: string
}
```

**Usage:**
```javascript
const result = safeSetItem('key', 'value');
if (!result.success) {
  console.error(result.error);
  // Handle error
}
```

**Error Handling:**
- Catches QuotaExceededError
- Catches SecurityError
- Falls back to in-memory storage
- Returns error details for user feedback

---

#### `safeGetItem(key, defaultValue)`
**Purpose:** Safe wrapper for localStorage.getItem

**Returns:**
```javascript
{
  success: boolean,
  value: string | null,
  error?: string
}
```

**Usage:**
```javascript
const result = safeGetItem('key', 'default');
if (result.success) {
  console.log('Value:', result.value);
} else {
  console.error('Failed to read:', result.error);
}
```

**Error Handling:**
- Returns default value on failure
- Logs error for debugging
- Never throws exceptions

---

#### `saveJSON(key, data)`
**Purpose:** Save JavaScript object as JSON with validation

**Returns:**
```javascript
{
  success: boolean,
  error?: string,
  errorType?: string,
  size?: number
}
```

**Features:**
- Automatic JSON.stringify
- Pre-save quota check
- Size reporting
- Handles circular references gracefully

**Usage:**
```javascript
const profiles = [...];
const result = saveJSON('fittrack_profiles', profiles);
if (!result.success) {
  showToast(result.error);
}
```

---

#### `loadJSON(key, defaultValue)`
**Purpose:** Load and parse JSON data safely

**Returns:**
```javascript
{
  success: boolean,
  data: any,
  error?: string
}
```

**Features:**
- Automatic JSON.parse
- Corruption handling
- Returns defaults on error
- Non-destructive (preserves corrupted data)

**Usage:**
```javascript
const result = loadJSON('fittrack_profiles', []);
const profiles = result.data; // Always safe to use
```

---

#### `checkStorageHealth()`
**Purpose:** Get storage usage and health status

**Returns:**
```javascript
{
  status: 'healthy' | 'warning' | 'critical',
  size: number, // bytes
  percentage: number // 0-100
}
```

**Thresholds:**
- **Healthy**: < 4MB (< 80%)
- **Warning**: 4-4.5MB (80-90%)
- **Critical**: > 4.5MB (> 90%)

**Usage:**
```javascript
const health = checkStorageHealth();
if (health.status === 'critical') {
  showToast(`Storage ${health.percentage}% full`);
}
```

---

## User-Facing Messages

### Design Principles

1. **Non-Technical**: Avoid jargon (no "localStorage", "JSON", etc.)
2. **Actionable**: Tell user what to do
3. **Honest**: Don't hide errors, but present positively
4. **Preserved**: Log technical details to console

### Message Guidelines

**DO:**
- ✅ "Storage full. Please export your data."
- ✅ "Data saved temporarily. Enable browser storage to keep it."
- ✅ "Unable to save. Try clearing old workouts."

**DON'T:**
- ❌ "QuotaExceededError in localStorage.setItem()"
- ❌ "JSON.parse() failed on line 1234"
- ❌ "SecurityError: Access denied"

---

## Recovery Procedures

### If Storage Fails

**Automatic Recovery:**
1. App switches to in-memory `Map` storage
2. User warned about lack of persistence
3. Data preserved for current session only
4. User prompted to fix storage issue

**User Actions:**
1. Check browser settings (disable private mode)
2. Clear old browser data to free space
3. Export data before clearing
4. Use different browser if needed

---

### If Data Corrupted

**Automatic Recovery:**
1. Corrupted data left untouched in localStorage
2. App uses default values for current session
3. Error logged with data preview
4. User notified but app continues working

**User Actions:**
1. Go to Settings → Advanced → View Storage
2. See corrupted data preview
3. Options:
   - Restore from backup (if exported)
   - Reset to defaults (destructive)
   - Manual recovery via browser DevTools

---

### Emergency Cleanup

**Function:** `emergencyCleanup()`

**What it removes:**
- Template seeding flags (non-essential)
- Cached nutrition data (can be re-seeded)
- Temporary flags and markers

**What it preserves:**
- User profiles
- Workout logs
- Diet logs
- Weight history
- Templates
- Saved meals

**Usage:**
```javascript
const result = emergencyCleanup();
console.log(`Freed ${result.freedBytes} bytes`);
```

**Implementation:** `js/storage.js:290-323`

---

## Testing Error Scenarios

### Test 1: Simulate Quota Exceeded

```javascript
// Fill localStorage to capacity
let i = 0;
try {
  while (true) {
    localStorage.setItem('test_' + i++, 'x'.repeat(100000));
  }
} catch (e) {
  console.log('Quota reached at', i, 'items');
}

// Now try saving profile - should trigger error handling
const result = saveJSON('fittrack_profiles', profiles);
console.log('Save result:', result);
```

**Expected:** Error message shown, fallback storage used

---

### Test 2: Simulate Private Browsing

**Steps:**
1. Open browser in private/incognito mode
2. Navigate to app
3. Try creating profile

**Expected:**
- Storage test detects disabled storage
- Warning shown immediately
- In-memory storage used
- App functions normally

---

### Test 3: Corrupt JSON Data

```javascript
// Manually corrupt data
localStorage.setItem('fittrack_profiles', '{invalid json[}');

// Reload app
location.reload();

// Check handling
const result = loadJSON('fittrack_profiles', []);
console.log('Corruption handled:', result.success === false);
console.log('Default returned:', Array.isArray(result.data));
```

**Expected:**
- Load fails gracefully
- Default empty array returned
- Error logged to console
- Original corrupt data preserved

---

### Test 4: Storage Unavailable

**Steps:**
1. Set browser to block all storage
2. Load app

**Expected:**
- `testLocalStorage()` detects unavailability
- In-memory Map used automatically
- User warned immediately
- App functions (no persistence)

---

## Integration Points

### App Startup (`js/app.js:65-69`)

**Before:**
```javascript
if (!localStorage.getItem('fittrack_current_profile')) {
  window.location.href = 'login.html';
}
```

**After:**
```javascript
const currentProfileCheck = safeGetItem('fittrack_current_profile');
if (!currentProfileCheck.value) {
  window.location.href = 'login.html';
}
```

---

### Profile Save (`js/app.js:83-111`)

**Before:**
```javascript
localStorage.setItem('fittrack_profiles', JSON.stringify(profiles));
```

**After:**
```javascript
const saveResult = saveJSON('fittrack_profiles', profiles);
if (!saveResult.success) {
  showToast(saveResult.error);

  const health = checkStorageHealth();
  if (health.status === 'critical') {
    showToast(`Storage ${health.percentage}% full. Export your data.`);
  }
}
```

---

### Login (`login.html:232-241`)

**Before:**
```javascript
const profilesData = localStorage.getItem('fittrack_profiles');
return profilesData ? JSON.parse(profilesData) : [];
```

**After:**
```javascript
const result = loadJSON('fittrack_profiles', []);
return result.success ? result.data : [];
```

---

## Logging & Debugging

### Console Logging

**Structure:**
```javascript
console.error('LocalStorage save failed:', {
  key: 'fittrack_profiles',
  error: 'QuotaExceededError',
  message: 'Storage quota exceeded',
  storageSize: 5242880, // bytes
  attemptedSize: 102400
});
```

**Benefits:**
- Structured data for debugging
- Storage context included
- Easy to filter in DevTools
- Safe to leave in production

---

### Debug Mode (Future Enhancement)

**Proposed:**
```javascript
// Enable verbose storage logging
localStorage.setItem('fittrack_debug_storage', 'true');

// Logs every storage operation
saveJSON('key', data); // Logs: "[STORAGE] Save: key (1234 bytes)"
loadJSON('key');       // Logs: "[STORAGE] Load: key (success)"
```

---

## Browser Compatibility

### Supported Browsers

| Browser | Version | Storage API | Error Handling |
|---------|---------|-------------|----------------|
| Chrome | 60+ | ✅ Full | ✅ Tested |
| Firefox | 60+ | ✅ Full | ✅ Tested |
| Safari | 11+ | ✅ Full | ✅ Tested |
| Edge | 79+ | ✅ Full | ✅ Tested |
| iOS Safari | 11+ | ✅ Full | ⚠️ Private mode limited |
| Chrome Android | 60+ | ✅ Full | ✅ Tested |

### Known Issues

**iOS Private Browsing:**
- localStorage.setItem() throws immediately
- Fallback storage works correctly
- User warned on first save attempt

**Firefox Tracking Protection:**
- May block localStorage in some cases
- testLocalStorage() detects correctly
- In-memory fallback activates

---

## Metrics & Monitoring

### Success Metrics

Track in production (future):
- Storage save success rate
- Error type distribution
- Storage usage over time
- Fallback activation rate

### Error Monitoring

Log to analytics (future):
```javascript
if (!saveResult.success) {
  // Send to analytics
  trackEvent('storage_error', {
    error_type: saveResult.errorType,
    storage_size: getStorageSize(),
    user_profiles: profiles.length
  });
}
```

---

## Future Enhancements

### Planned Improvements

1. **IndexedDB Fallback** (v1.3.0)
   - Use IndexedDB when localStorage full
   - 50MB+ capacity
   - Async API

2. **Data Compression** (v1.4.0)
   - LZ-string compression for large objects
   - Reduce storage usage by 60-80%
   - Transparent to app logic

3. **Cloud Sync** (v2.0.0)
   - Optional server-side backup
   - Automatic conflict resolution
   - Cross-device sync

4. **Smart Cleanup** (v1.2.0)
   - Automatic cleanup of old data
   - User-configurable retention
   - Archive old workouts

---

## Appendix: Complete API Reference

### Functions

| Function | Purpose | Returns | Throws |
|----------|---------|---------|--------|
| `safeSetItem(key, value)` | Save string | `{success, error?}` | No |
| `safeGetItem(key, default?)` | Load string | `{success, value, error?}` | No |
| `safeRemoveItem(key)` | Delete key | `{success, error?}` | No |
| `saveJSON(key, data)` | Save object | `{success, error?, size?}` | No |
| `loadJSON(key, default?)` | Load object | `{success, data, error?}` | No |
| `checkStorageHealth()` | Check usage | `{status, size, percentage}` | No |
| `getStorageSize()` | Get total size | `number` (bytes) | No |
| `formatStorageSize(bytes)` | Format size | `string` (e.g., "2.5 MB") | No |
| `testLocalStorage()` | Test availability | `{available, error?}` | No |
| `emergencyCleanup()` | Free space | `{cleaned, freedBytes}` | No |
| `exportAllData()` | Export backup | `{success, data?, error?}` | No |

---

**Document Version:** 1.0
**Maintainer:** Repository Owner
**Last Review:** 2025-11-10
