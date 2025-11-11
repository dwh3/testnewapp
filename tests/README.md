# FitTrack Testing Guide

## CI/CD

GitHub Actions runs **build validation** on every push:
- ✅ Validates critical files exist (HTML, JS, config, docs)
- ✅ Checks JavaScript syntax for all .js files
- ✅ Verifies manual test infrastructure is present
- ✅ Confirms documentation files are complete

**Note**: This project uses a combination of:
- **Automated unit tests** (Jest) for crypto and storage modules
- **Manual testing** (browser-based) for UI and Phase 3.1 features

See workflow: `.github/workflows/tests.yml`

## Overview

This testing infrastructure validates the security fixes and error handling implemented in Phase 2.1 (PIN security) and Phase 2.2 (localStorage error handling).

**Phase 3.1 features** (edit/delete functionality) use manual testing. See manual test files in `tests/manual/` directory.

## Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Verbose output
npm run test:verbose
```

## Test Structure

```
tests/
├── setup.js                    # Test environment configuration
├── unit/                       # Unit tests for individual modules (Jest)
│   ├── crypto.test.js          # PIN hashing tests (37 tests)
│   └── storage.test.js         # Storage wrapper tests (66 tests)
├── integration/                # Integration tests for user flows
│   └── (future tests)
├── manual/                     # Manual browser-based tests
│   ├── test-crypto.html        # Crypto utilities manual test
│   ├── test-storage.html       # Storage wrapper manual test
│   ├── test-config.html        # Configuration system test
│   └── test-edit-delete.html   # Phase 3.1 edit/delete functionality (53 tests)
└── fixtures/                   # Reusable test data
    ├── users.js                # User profile fixtures
    ├── workouts.js             # Workout data fixtures
    └── profiles.js             # Complete profile fixtures
```

### Manual Testing

Phase 3.1 features (edit/delete) are tested manually:
- Open `tests/manual/test-edit-delete.html` in a browser
- Follow the 53-item checklist
- Progress is saved to localStorage
- Tests validate: edit/delete UI, data persistence, nutrition recalculation

## Test Coverage

### Current Test Count: 103 tests

#### Crypto Module (`js/crypto.js`) - 37 tests
- ✅ `isCryptoAvailable()` - 1 test
- ✅ `generateSalt()` - 3 tests
- ✅ `hashPin()` - 10 tests
- ✅ `verifyPin()` - 10 tests
- ✅ `migratePlaintextPin()` - 6 tests
- ✅ Performance tests - 2 tests
- ✅ Security property tests - 4 tests

**Coverage Goal: 90%+** (Critical security module)

#### Storage Module (`js/storage.js`) - 66 tests
- ✅ `safeSetItem/safeGetItem()` - 7 tests
- ✅ `saveJSON/loadJSON()` - 11 tests
- ✅ `safeRemoveItem()` - 3 tests
- ✅ `getStorageSize()` - 4 tests
- ✅ `checkStorageHealth()` - 4 tests
- ✅ `formatStorageSize()` - 6 tests
- ✅ `testLocalStorage()` - 3 tests
- ✅ `emergencyCleanup()` - 4 tests
- ✅ `exportAllData()` - 6 tests
- ✅ Error handling - 4 tests
- ✅ Integration tests - 2 tests

**Coverage Goal: 90%+** (Critical error handling module)

### Overall Coverage Goals
- **Critical utilities** (crypto, storage): 90%+
- **Overall codebase**: 60%+
- **UI code** (app.js): 40%+ (harder to test without DOM)

## Writing Tests

### Unit Test Example

```javascript
describe('Function Name', () => {
  test('should do something specific', () => {
    const result = functionToTest(input);
    expect(result).toBe(expectedOutput);
  });
});
```

### Using Fixtures

```javascript
const { validUser } = require('../fixtures/users');

test('should accept valid user', () => {
  expect(validateUser(validUser)).toBe(true);
});
```

### Testing Async Functions

```javascript
test('should hash PIN asynchronously', async () => {
  const result = await hashPin('1234');
  expect(result.hash).toBeTruthy();
});
```

### Testing Error Handling

```javascript
test('should handle QuotaExceededError', () => {
  // Mock localStorage to throw error
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = jest.fn(() => {
    const error = new Error('QuotaExceededError');
    error.name = 'QuotaExceededError';
    throw error;
  });

  const result = safeSetItem('test', 'value');
  expect(result.success).toBe(false);
  expect(result.errorType).toBe('QuotaExceededError');

  // Restore original
  Storage.prototype.setItem = originalSetItem;
});
```

## Test Categories

### Security Tests (Crypto Module)
Validates Phase 2.1 implementation:
- PIN hashing with PBKDF2
- 100,000 iterations
- 16-byte salts
- 256-bit output
- Secure verification
- Migration from plaintext

**Critical Tests:**
- Different PINs produce different hashes
- Same PIN with different salts produces different hashes
- Correct PIN verification succeeds
- Incorrect PIN verification fails
- Hash cannot be reversed to PIN
- Migration rejects invalid PINs

### Error Handling Tests (Storage Module)
Validates Phase 2.2 implementation:
- QuotaExceededError handling
- SecurityError handling (private browsing)
- JSON corruption recovery
- Storage health monitoring
- Emergency cleanup
- Data export

**Critical Tests:**
- Save succeeds when storage available
- Save fails gracefully when quota exceeded
- Save fails gracefully in private browsing
- Corrupted data returns default value
- Health status calculated correctly
- Cleanup frees storage space

### Performance Tests
- PIN hashing completes in <1000ms
- PIN verification completes in <1000ms
- Storage operations are fast

### Integration Tests
- Full workflow: save → load → modify → remove
- Multiple concurrent operations
- Profile creation → PIN migration → authentication

## CI/CD Integration

Tests run automatically on:
- ✅ Push to main branch
- ✅ Pull requests to main branch
- ✅ Multiple Node.js versions (18.x, 20.x)

**PR Requirements:**
- All tests must pass
- Coverage thresholds must be met
- No syntax errors

## Debugging Tests

### Run Specific Test File
```bash
npm test tests/unit/crypto.test.js
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="PIN"
```

### Enable Debug Output
```bash
npm test -- --verbose --no-coverage
```

### View Console Errors
Uncomment these lines in `tests/setup.js`:
```javascript
// originalConsole.error(...args);
// originalConsole.warn(...args);
```

## Mock Environment

### localStorage
- Provided by `jest-localstorage-mock`
- Automatically cleared before each test
- Full read/write/remove support

### Web Crypto API
- Provided by Node.js `webcrypto`
- Full PBKDF2 support
- `crypto.getRandomValues()` available

### Console
- Errors and warnings mocked by default
- Prevents test output noise
- Uncomment in setup.js to debug

## Test Fixtures

### Available Fixtures

**Users (`tests/fixtures/users.js`):**
- `validUser` - Basic user profile
- `userWithHashedPin` - User with secure PIN
- `legacyUserWithPlaintextPin` - User needing migration
- `multipleUsers` - Array of test users
- `userWithCompleteProfile` - Full user data

**Workouts (`tests/fixtures/workouts.js`):**
- `singleExercise` - Single exercise data
- `fullWorkout` - Complete workout session
- `workoutTemplate` - Reusable workout template
- `multipleWorkouts` - Array of workout sessions
- `exerciseTemplates` - Exercise library

**Profiles (`tests/fixtures/profiles.js`):**
- `emptyProfile` - New user profile
- `activeProfile` - Profile with data
- `profilesArray` - Multiple profiles
- `profileWithLegacyPin` - Migration test data
- `completeProfileData` - Full profile with all features

## Coverage Reports

### Viewing Coverage

After running `npm run test:coverage`, open:
```bash
open coverage/lcov-report/index.html
```

### Coverage Metrics
- **Statements**: % of code statements executed
- **Branches**: % of if/else branches executed
- **Functions**: % of functions called
- **Lines**: % of code lines executed

### Coverage Thresholds (jest.config.js)
```javascript
coverageThreshold: {
  global: {
    statements: 60,
    branches: 55,
    functions: 60,
    lines: 60
  }
}
```

## Common Issues

### Issue: "Cannot use import statement outside a module"
**Solution:** Ensure `"type": "module"` is in package.json

### Issue: "Cannot find module 'js/crypto.js'"
**Solution:** Use dynamic imports in tests:
```javascript
const cryptoModule = await import('../../js/crypto.js');
```

### Issue: "localStorage is not defined"
**Solution:** Ensure `jest-localstorage-mock` is in setup.js

### Issue: "crypto.subtle is undefined"
**Solution:** Ensure Web Crypto mock is loaded in setup.js:
```javascript
const { webcrypto } = require('crypto');
global.crypto = webcrypto;
```

## Future Enhancements

### Planned Integration Tests
- [ ] User registration flow
- [ ] PIN migration on login
- [ ] Workout creation and persistence
- [ ] Meal logging with storage errors
- [ ] Profile switching
- [ ] Data export/import

### Planned E2E Tests
- [ ] Browser-based tests with Playwright
- [ ] PWA offline functionality
- [ ] Service Worker caching
- [ ] UI interactions

### Additional Test Coverage
- [ ] app.js core functions (40%+ target)
- [ ] UI component testing
- [ ] Form validation
- [ ] Chart rendering
- [ ] Timer functionality

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [LocalStorage Testing](https://testing-library.com/docs/ecosystem-jest-localstorage-mock/)

## Contributing

When adding new features:
1. Write tests BEFORE implementation (TDD)
2. Ensure 90%+ coverage for security modules
3. Update fixtures if needed
4. Document new test categories in this README
5. Verify all tests pass before committing

## Support

Questions about testing? Check:
- This README
- Test file comments
- Jest configuration (jest.config.js)
- Test setup file (tests/setup.js)
