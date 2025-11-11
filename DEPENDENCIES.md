# Dependency Management Policy

## Overview

This document defines the dependency management strategy for FitTrack PWA to ensure security, stability, and maintainability.

## Dependency Inventory

### Production Dependencies (CDN-loaded)

| Dependency | Version | Type | Purpose | Security |
|------------|---------|------|---------|----------|
| Bootstrap | 5.3.0 | CSS Framework | UI components and responsive layout | ⚠️ Unpinned |
| Bootstrap Icons | 1.10.0 | Icon Library | UI icons | ⚠️ Unpinned |
| Chart.js | **4.4.6** | Data Visualization | Exercise/diet progress charts | ✅ Pinned with SRI |

### Development Dependencies (NPM)

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| jest | ^30.2.0 | Testing framework | MIT |
| jest-environment-jsdom | ^30.2.0 | DOM testing environment | MIT |
| jest-localstorage-mock | ^2.4.26 | localStorage mocking | MIT |
| @testing-library/dom | ^10.4.1 | DOM testing utilities | MIT |
| @testing-library/jest-dom | ^6.9.1 | Jest DOM matchers | MIT |

## Version Pinning Strategy

### Production Dependencies

**Policy: Use exact versions for all production dependencies**

- **CDN dependencies**: Pin to exact version with SRI hash
- **NPM dependencies**: Use exact versions (no `^` or `~`)
- **Rationale**: Prevents unexpected breaking changes in production

**Example:**
```html
<!-- ✅ CORRECT: Pinned with SRI -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.6/dist/chart.umd.min.js"
        integrity="sha384-..." crossorigin="anonymous"></script>

<!-- ❌ INCORRECT: Unpinned version -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

### Development Dependencies

**Policy: Use caret ranges for development dependencies**

- **Format**: `^X.Y.Z` (allows patch and minor updates)
- **Rationale**: Allows receiving bug fixes and new features in development tools
- **Safety**: Breaking changes tested in CI before affecting production

## Update Schedule

### Security Updates
- **Frequency**: Immediate
- **Trigger**: CVE disclosure, npm audit alert, Dependabot notification
- **Process**:
  1. Dependabot creates PR with vulnerability details
  2. Review security advisory and changelog
  3. Run full test suite
  4. Merge if tests pass
  5. Deploy to production within 24 hours

### Patch Updates (X.Y.**Z**)
- **Frequency**: Monthly
- **Trigger**: First Monday of each month
- **Process**:
  1. Run `npm outdated` to identify updates
  2. Review changelogs for bug fixes
  3. Update versions in `package.json`
  4. Run `npm test` and manual testing
  5. Commit and deploy if stable

### Minor Updates (X.**Y**.Z)
- **Frequency**: Quarterly
- **Trigger**: End of quarter (Mar, Jun, Sep, Dec)
- **Process**:
  1. Review release notes for new features
  2. Update in feature branch
  3. Comprehensive testing (unit + integration + manual)
  4. Regression testing for existing features
  5. Merge to main after approval

### Major Updates (**X**.Y.Z)
- **Frequency**: Annual or as-needed
- **Trigger**: End of year review or critical feature requirement
- **Process**:
  1. Review migration guide and breaking changes
  2. Create dedicated feature branch
  3. Update code to handle breaking changes
  4. Update tests for API changes
  5. Extended testing period (1-2 weeks)
  6. Staged rollout with rollback plan

## Security Best Practices

### Subresource Integrity (SRI)

All CDN resources MUST include SRI hashes to prevent tampering:

```html
<script src="https://cdn.example.com/library@1.0.0/lib.min.js"
        integrity="sha384-HASH_HERE"
        crossorigin="anonymous"></script>
```

**Generate SRI hash:**
```bash
curl https://cdn.jsdelivr.net/npm/chart.js@4.4.6/dist/chart.umd.min.js | \
  openssl dgst -sha384 -binary | openssl base64 -A
```

### Vulnerability Monitoring

- **Dependabot**: Automated daily scans for security vulnerabilities
- **npm audit**: Run before every release
- **GitHub Security Advisories**: Monitor for alerts

### Audit Commands

```bash
# Check for vulnerabilities in production dependencies
npm audit --production

# Check for outdated packages
npm outdated

# Update to latest secure versions (development only)
npm update

# Fix vulnerabilities automatically (review changes!)
npm audit fix
```

## Dependency Update Process

### 1. Check for Updates

```bash
# Check outdated packages
npm outdated

# Check security vulnerabilities
npm audit
```

### 2. Review Changes

- Read release notes and changelogs
- Check for breaking changes
- Review migration guides for major updates

### 3. Test Updates

```bash
# Update package.json
vim package.json

# Install updated dependencies
npm install

# Run full test suite
npm test

# Run coverage check
npm run test:coverage

# Manual testing in browser
# - Test chart rendering (Exercise Progress, Weight Chart)
# - Test localStorage operations
# - Test offline functionality
```

### 4. Commit Changes

```bash
git add package.json package-lock.json
git commit -m "chore: Update dependencies

- Updated [package] from X.Y.Z to A.B.C
- Security: Fixes CVE-YYYY-XXXXX
- See: https://github.com/org/repo/releases/tag/vA.B.C"
```

### 5. Deploy and Monitor

- Deploy to production
- Monitor error logs for 24-48 hours
- Roll back if issues detected

## CDN Fallback Strategy

For critical CDN dependencies, implement fallback to local copies:

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.6/dist/chart.umd.min.js"
        integrity="sha384-..." crossorigin="anonymous"></script>
<script>
  // Fallback to local copy if CDN fails
  if (typeof Chart === 'undefined') {
    document.write('<script src="/js/vendor/chart.min.js"><\/script>');
  }
</script>
```

**Status**: Not yet implemented (future enhancement)

## Dependabot Configuration

Dependabot is configured to:
- Check for updates daily
- Create PRs for security vulnerabilities immediately
- Group non-security updates weekly
- Auto-merge patch updates after tests pass

See `.github/dependabot.yml` for full configuration.

## Dependency Approval Checklist

Before adding a new dependency, verify:

- [ ] **Necessity**: Is this dependency truly needed? Can we use native browser APIs?
- [ ] **Security**: No known vulnerabilities (check npm audit, Snyk, GitHub Security)
- [ ] **Maintenance**: Active maintenance (commits within 6 months)
- [ ] **License**: Compatible license (MIT, Apache 2.0, BSD)
- [ ] **Bundle Size**: Acceptable impact on load time (<50KB for production)
- [ ] **Alternatives**: Compared with alternative libraries
- [ ] **Documentation**: Well-documented with examples
- [ ] **Community**: Active community support (GitHub stars, Stack Overflow)

## Removal Criteria

Remove dependencies when:
- No longer used in codebase
- Superseded by native browser APIs
- Abandoned by maintainers (no updates for 1+ year)
- Security vulnerabilities with no fix available
- Better alternatives available

## Current Action Items

### High Priority
- [ ] Pin Bootstrap to exact version (currently unpinned: `@5.3.0`)
- [ ] Pin Bootstrap Icons to exact version (currently unpinned: `@1.10.0`)
- [ ] Add SRI hashes to Bootstrap and Bootstrap Icons
- [x] ~~Pin Chart.js to exact version 4.4.6~~ ✅ COMPLETED
- [x] ~~Add SRI hash to Chart.js~~ ✅ COMPLETED

### Medium Priority
- [ ] Implement CDN fallback strategy for critical dependencies
- [ ] Add bundle size monitoring to CI/CD pipeline
- [ ] Document manual testing checklist for dependency updates

### Low Priority
- [ ] Evaluate moving Chart.js from CDN to NPM for better caching
- [ ] Consider self-hosting critical dependencies for offline-first support

## Resources

- [npm Audit Documentation](https://docs.npmjs.com/cli/v9/commands/npm-audit)
- [Semantic Versioning (SemVer)](https://semver.org/)
- [Subresource Integrity (SRI)](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)
- [GitHub Dependabot](https://docs.github.com/en/code-security/dependabot)

---

**Last Updated**: 2025-11-10
**Next Review**: 2025-12-10 (Monthly)
**Owner**: Development Team
