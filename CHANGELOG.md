# Changelog

All notable changes to FitTrack PWA will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2025-11-12

### Added
- **Phase 3.1: Edit/Delete Functionality**
  - Edit workout sets (weight, reps, RIR)
  - Delete workout sets with confirmation dialog
  - Edit meal entries (quantity, meal time)
  - Delete meal entries with confirmation dialog
  - Unique IDs for all new entries (timestamp + random string)
  - Automatic nutrition recalculation on quantity changes
  - Day total recalculation helper function
  - Empty day cleanup (removes days with no entries)
  - Edit/delete buttons in UI (workout and meal displays)
  - Two modal forms (workout edit, meal edit)
  - Console logging for debugging operations
  - Toast/alert notifications for user feedback

### Changed
- `enableEditEntries: true` in production config (Phase 3.1 complete)
- `enableDeleteEntries: true` in production config (Phase 3.1 complete)
- Renamed food entry 'id' field to 'foodId' to avoid confusion with entryId
- Updated FUNCTIONALITY_STATUS.md with edit/delete documentation

### Technical Details
- Edit modals use established modal-overlay pattern
- Quantity-based recalculation: nutrition values scaled by newQty/oldQty ratio
- Backward compatible: buttons only show for entries with IDs
- Meal edits preserve all entry metadata, only update specified fields
- Delete operations use splice() for array removal

## [1.1.0] - 2025-11-11

### Security
- **[HIGH]** Pinned Chart.js to exact version 4.4.6 with SRI integrity hash
- Added Subresource Integrity (SRI) protection for Chart.js CDN resource
- Configured Dependabot for automated security monitoring

### Added
- **Phase 2.5: Configuration Management System**
  - Environment detection (development/production)
  - Feature flag system with 8 flags
  - Hierarchical configuration (default → environment overrides)
  - Configuration utility functions (isFeatureEnabled, getConfigValue)
  - Environment-specific configs (development.js, production.js)
  - CONFIG.md documentation (685 lines)
  - Manual test page (test-config.html)
- Comprehensive DEPENDENCIES.md with dependency management policy
- Dependabot configuration for automated dependency updates
- Version pinning strategy for production and development dependencies
- Security update schedule and process documentation
- Dependency approval checklist

### Changed
- Updated Chart.js from unpinned version to pinned 4.4.6
- Enhanced security posture with SRI hashes for CDN dependencies

## [1.0.0] - 2025-11-10

### Added
- **Phase 2.1: PIN Security**
  - PBKDF2 PIN hashing with 100,000 iterations
  - Web Crypto API integration for secure PIN storage
  - SHA-256 hashing with 16-byte random salts
  - Automatic migration from plaintext PINs to hashed PINs
  - PIN verification with constant-time comparison

- **Phase 2.2: localStorage Error Handling**
  - Comprehensive localStorage wrapper with error handling
  - QuotaExceededError handling for storage limits
  - SecurityError handling for private browsing mode
  - JSON serialization/deserialization with corruption recovery
  - In-memory Map fallback when localStorage unavailable
  - Emergency cleanup utility for quota management
  - Storage health monitoring and diagnostics

- **Testing Infrastructure**
  - Jest testing framework with jsdom environment
  - 89 comprehensive tests (36 crypto + 53 storage)
  - 81.88% code coverage (exceeds 60% threshold)
  - ES6 module support with experimental VM modules
  - GitHub Actions CI/CD pipeline
  - Multi-version Node.js testing (18.x, 20.x)
  - Automated coverage reporting
  - tests/README.md with comprehensive testing guide

### Security
- **[CRITICAL]** Eliminated plaintext PIN storage
- **[HIGH]** Implemented PBKDF2 with OWASP-recommended 100,000 iterations
- **[MEDIUM]** Added robust localStorage error handling to prevent data loss

### Fixed
- GitHub Actions: package-lock.json dependency caching
- Jest coverage threshold failures (app.js exclusion)
- Crypto test failures in ES6 module scope
- Storage test failures with jest mock limitations

### Documentation
- Added tests/README.md with 89 test descriptions
- Documented crypto utilities and security implementation
- Added storage wrapper API documentation
- Created testing guide with debugging instructions

## [0.9.0] - Earlier

### Added
- Initial FitTrack PWA implementation
- Exercise logging with workout templates
- Diet tracking with food database integration
- Progress charts using Chart.js
- Weight tracking
- Profile management with PIN protection
- Offline-first PWA with service worker
- Responsive mobile-first design
- Bootstrap 5 UI framework

### Features
- **Exercise Tracking**
  - Workout templates
  - Active workout tracking
  - Set logging with rest timers
  - Weekly progress charts
  - Exercise search and filtering

- **Diet Tracking**
  - Food search via CalorieNinjas API
  - Manual macro entry
  - Meal builder for custom meals
  - Quick add from recent foods
  - Calorie and protein goal tracking

- **Progress Monitoring**
  - Weight chart visualization
  - Weekly set volume tracking
  - Daily calorie/protein summaries
  - 7-day diet history

---

## Release Notes

### Security Releases

When a security vulnerability is discovered:
1. Immediate notification via GitHub Security Advisory
2. Patch released within 24 hours
3. Users notified via release notes
4. Upgrade instructions provided

### Upgrade Instructions

#### Upgrading to v1.0.0

No special steps required for users. Data migration handled automatically:

1. **PIN Migration**: Existing profiles with plaintext PINs will be automatically hashed on first login
2. **Storage**: localStorage wrapper is backward compatible
3. **Testing**: New test infrastructure for developers only

For developers:
```bash
# Install new dev dependencies
npm install

# Run test suite
npm test

# Check coverage
npm run test:coverage
```

---

## Version History

- **v1.0.0** (2025-11-10): Security hardening (PIN hashing, storage error handling, testing)
- **v0.9.0** (Earlier): Initial PWA implementation

---

## Links

- [Repository](https://github.com/dwh3/testnewapp)
- [Issue Tracker](https://github.com/dwh3/testnewapp/issues)
- [Security Policy](SECURITY.md) _(future)_
- [Contributing Guidelines](CONTRIBUTING.md) _(future)_
