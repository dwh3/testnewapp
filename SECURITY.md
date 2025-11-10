# Security Policy

## Overview

FitTrack is a client-side Progressive Web Application (PWA) that stores all data locally using browser localStorage. This document outlines our security approach, known limitations, and best practices for users.

## PIN Security

### Implementation

User PINs are protected using cryptographic hashing:

- **Algorithm**: PBKDF2 (Password-Based Key Derivation Function 2)
- **Hash Function**: SHA-256
- **Iterations**: 100,000 (OWASP recommended minimum as of 2024)
- **Salt**: 16-byte random salt per PIN, stored alongside hash
- **Output**: 256-bit derived key

### Security Properties

✅ **Protects Against:**
- Casual inspection of localStorage data
- Accidental exposure in screenshots or logs
- Simple data exfiltration without device access
- Dictionary attacks (due to high iteration count)
- Rainbow table attacks (due to unique salts)

### Code Location

PIN hashing implementation: `login.html` lines 139-216
- `hashPin()` - Generate PBKDF2 hash with salt
- `verifyPinHash()` - Constant-time PIN verification
- `migrateProfilePins()` - Automatic migration from plaintext

## Known Limitations

### Client-Side Security Constraints

⚠️ **Important**: This application uses **client-side security**, which has inherent limitations:

1. **Device Access**: Anyone with physical or remote access to the device can:
   - Inspect localStorage directly via browser DevTools
   - Modify JavaScript code to bypass PIN checks
   - Extract hashed PINs and attempt offline brute-force
   - Access all user data while the app is running

2. **Browser Security**: The app relies on:
   - Browser same-origin policy
   - localStorage encryption (if enabled by OS)
   - Web Crypto API availability

3. **No Server-Side Validation**:
   - All authentication happens client-side
   - No rate limiting on failed PIN attempts (beyond UI delays)
   - No account lockout mechanisms
   - No recovery options if device is lost

### What We Don't Protect Against

❌ **Does NOT protect against:**
- Malware or keyloggers on the device
- Browser extensions with broad permissions
- Physical device theft without encryption
- Compromised browser or operating system
- Shoulder surfing (watching PIN entry)
- Brute-force attacks with device access

## Best Practices for Users

### Recommended Security Measures

1. **Enable Device Encryption**
   - iOS: Enabled by default with device passcode
   - Android: Settings → Security → Encrypt phone
   - Windows: BitLocker
   - macOS: FileVault

2. **Use Device Lock Screen**
   - Set a strong device passcode/password
   - Enable auto-lock after inactivity
   - Use biometric authentication when available

3. **Browser Security**
   - Use a modern, updated browser
   - Don't install untrusted browser extensions
   - Clear browser data on shared devices
   - Use private/incognito mode on public devices

4. **PIN Selection**
   - Avoid obvious PINs (1234, 0000, birth year)
   - Don't reuse PINs from other services
   - Don't share your PIN with others

5. **Device Sharing**
   - Don't leave the app logged in on shared devices
   - Log out when not in use
   - Create separate profiles for different users
   - Don't share devices with sensitive data

### Data Backup

⚠️ **No Cloud Backup**: All data is stored locally. Device loss = data loss.

**Recommendations:**
- Export your data regularly (feature coming soon)
- Sync device backups to cloud (if enabled, includes app data)
- Take screenshots of important data

## Migration from Plaintext PINs

### Automatic Migration

Existing users with plaintext PINs (prior to v1.1.0) are **automatically migrated** on their next login:

1. App loads and runs `migrateProfilePins()`
2. For each profile with `pin` field (plaintext):
   - Generate PBKDF2 hash with new random salt
   - Store `pinHash` and `pinSalt`
   - Delete `pin` field (plaintext removed)
3. User experience unchanged - PIN still works

### Verification

After migration, you can verify PIN is hashed:

1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. View `fittrack_profiles` key
4. Check profiles have `pinHash` and `pinSalt` fields
5. Verify no `pin` field exists (plaintext removed)

### Rollback

⚠️ **No rollback**: Once migrated, you cannot revert to plaintext PINs. This is intentional for security.

## Browser Compatibility

### Required APIs

- Web Crypto API (`crypto.subtle`)
- LocalStorage
- Service Workers (for PWA functionality)

### Supported Browsers

✅ **Full Support:**
- Chrome/Edge 60+
- Firefox 60+
- Safari 11+
- iOS Safari 11+
- Chrome Android 60+

❌ **Not Supported:**
- Internet Explorer (any version)
- Legacy browsers without Web Crypto API

### Fallback Behavior

If Web Crypto API is unavailable:
- PIN creation fails with error message
- App will not allow new user registration
- Existing users cannot log in
- **No plaintext fallback** (by design)

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **DO NOT** open a public GitHub issue
2. Email security concerns to: [repository maintainer]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Fix Timeline**: Depends on severity
  - Critical: Within 7 days
  - High: Within 30 days
  - Medium: Within 90 days

## Security Changelog

### v1.1.0 (Current) - 2025-11-10
- ✅ **SECURITY FIX**: Implemented PBKDF2 PIN hashing
- ✅ Automatic migration from plaintext PINs
- ✅ 100,000 iteration count (OWASP minimum)
- ✅ 16-byte random salt per PIN
- ✅ Removed all plaintext PIN storage

### v1.0.18 (Previous)
- ⚠️ **INSECURE**: PINs stored in plaintext localStorage
- ⚠️ **VULNERABILITY**: CVE-pending (plaintext credential storage)

## Future Security Enhancements

### Planned Improvements

1. **Rate Limiting** (v1.2.0)
   - Limit PIN attempts per profile
   - Exponential backoff after failures
   - Temporary lockout after 5 failed attempts

2. **Biometric Authentication** (v1.3.0)
   - WebAuthn API integration
   - Fingerprint/Face ID as alternative to PIN
   - Fallback to PIN if biometric fails

3. **Optional Cloud Sync** (v2.0.0)
   - End-to-end encrypted cloud backup
   - Cross-device synchronization
   - Server-side authentication

4. **Advanced Security** (Future)
   - Two-factor authentication (2FA)
   - Hardware security key support
   - Audit log of access attempts

## Security Principles

Our security approach follows these principles:

1. **Defense in Depth**: Multiple layers of security
2. **Least Privilege**: Minimal permissions requested
3. **Secure by Default**: Hashing enabled automatically
4. **Transparency**: Open documentation of security measures
5. **User Education**: Clear communication of limitations

## Technical Details

### PBKDF2 Parameters

```javascript
{
  name: 'PBKDF2',
  salt: crypto.getRandomValues(new Uint8Array(16)), // 128 bits
  iterations: 100000,  // OWASP minimum (2024)
  hash: 'SHA-256'      // 256-bit output
}
```

### Iteration Count Rationale

- **100,000 iterations** chosen based on:
  - OWASP recommendation (2023-2024)
  - Balance between security and performance
  - ~100ms hashing time on modern hardware
  - Resistant to GPU-based attacks

- **Future increases**: Iteration count may increase in future versions as hardware improves

### Salt Generation

- **16 bytes (128 bits)** random salt per PIN
- Generated using `crypto.getRandomValues()`
- Stored in hex format alongside hash
- Unique per user (prevents rainbow tables)

## Compliance

### Data Protection

- **GDPR**: All data stored locally, no data transmission
- **CCPA**: No data collection or sale
- **COPPA**: No age verification, parental supervision recommended

### Standards

- ✅ OWASP Password Storage Cheat Sheet (2024)
- ✅ NIST SP 800-63B (Digital Identity Guidelines)
- ⚠️ PCI DSS: Not applicable (no payment data)

## License & Warranty

This software is provided "as is" without warranty of any kind. The developers are not responsible for data loss, security breaches, or misuse of the application.

---

**Last Updated**: 2025-11-10
**Version**: 1.1.0
**Maintainer**: [Repository Owner]
