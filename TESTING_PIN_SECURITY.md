# PIN Security Testing Checklist

## Pre-Testing Setup

- [ ] Backup any existing localStorage data
- [ ] Open browser DevTools (F12)
- [ ] Open Console tab for logging
- [ ] Open Application tab → Local Storage
- [ ] Clear existing `fittrack_profiles` data (for clean test)

## Test 1: New User PIN Creation

### Steps:
1. [ ] Open `login.html` in browser
2. [ ] Fill in name: "Test User 1"
3. [ ] Enter PIN: 1234
4. [ ] Click "Create Profile"

### Expected Results:
- [ ] Success message appears
- [ ] Redirects to `index.html`
- [ ] In DevTools → Application → Local Storage:
  - [ ] `fittrack_profiles` exists
  - [ ] Profile has `pinHash` field (long hex string)
  - [ ] Profile has `pinSalt` field (32-character hex string)
  - [ ] Profile does NOT have `pin` field (no plaintext)
- [ ] Console shows: "Profile created!" (no errors)

### Verification:
```javascript
// Run in browser console:
const profiles = JSON.parse(localStorage.getItem('fittrack_profiles'));
console.log('Profile:', profiles[0]);
console.log('Has pinHash:', !!profiles[0].pinHash);
console.log('Has pinSalt:', !!profiles[0].pinSalt);
console.log('Has plaintext pin:', !!profiles[0].pin); // Should be false
```

**Pass Criteria**: ✅ `pinHash` and `pinSalt` exist, `pin` does NOT exist

---

## Test 2: PIN Verification (Correct PIN)

### Steps:
1. [ ] Refresh page or navigate back to `login.html`
2. [ ] Click on "Test User 1" profile
3. [ ] Enter correct PIN: 1234
4. [ ] Click "Sign In"

### Expected Results:
- [ ] Success message appears
- [ ] Redirects to `index.html`
- [ ] User is logged in
- [ ] Console shows no errors

**Pass Criteria**: ✅ Successful login with hashed PIN

---

## Test 3: PIN Verification (Incorrect PIN)

### Steps:
1. [ ] Navigate back to `login.html`
2. [ ] Click on "Test User 1" profile
3. [ ] Enter wrong PIN: 5678
4. [ ] Click "Sign In"

### Expected Results:
- [ ] Error message: "Incorrect PIN. Please try again."
- [ ] PIN fields cleared
- [ ] Focus returns to first PIN field
- [ ] Does NOT redirect
- [ ] User remains on login page

### Verification:
Try multiple incorrect PINs:
- [ ] 0000
- [ ] 9999
- [ ] 1235

**Pass Criteria**: ✅ All incorrect PINs rejected

---

## Test 4: Existing User Migration

### Setup:
1. [ ] Open browser console
2. [ ] Create old-style plaintext profile:
```javascript
const profiles = JSON.parse(localStorage.getItem('fittrack_profiles') || '[]');
profiles.push({
  id: Date.now().toString(),
  name: 'Legacy User',
  pin: '4321', // Plaintext PIN (old format)
  createdAt: new Date().toISOString(),
  data: {
    calorieGoal: 2200,
    proteinGoal: 160,
    weightHistory: [],
    dietLog: {},
    setsLog: []
  }
});
localStorage.setItem('fittrack_profiles', JSON.stringify(profiles));
console.log('Created legacy profile with plaintext PIN');
```

### Steps:
1. [ ] Refresh `login.html` page
2. [ ] Wait for page load (migration runs automatically)
3. [ ] Check console for migration message

### Expected Results During Migration:
- [ ] Console shows: "PIN migration completed for X profile(s)"
- [ ] In DevTools → Local Storage:
  - [ ] "Legacy User" profile now has `pinHash`
  - [ ] "Legacy User" profile now has `pinSalt`
  - [ ] "Legacy User" profile NO LONGER has `pin` field

### Login Test After Migration:
1. [ ] Click on "Legacy User" profile
2. [ ] Enter PIN: 4321 (original plaintext PIN)
3. [ ] Click "Sign In"

### Expected Results:
- [ ] Successful login
- [ ] Redirects to `index.html`
- [ ] PIN still works even though now hashed

### Verification:
```javascript
// Check migration worked:
const profiles = JSON.parse(localStorage.getItem('fittrack_profiles'));
const legacy = profiles.find(p => p.name === 'Legacy User');
console.log('Legacy user:', legacy);
console.log('Migrated - has pinHash:', !!legacy.pinHash);
console.log('Migrated - has pinSalt:', !!legacy.pinSalt);
console.log('Migrated - plaintext removed:', !legacy.pin); // Should be true
```

**Pass Criteria**: ✅ Old plaintext PIN migrated to hashed format, still works for login

---

## Test 5: No Plaintext PINs in localStorage

### Steps:
1. [ ] Open DevTools → Application → Local Storage
2. [ ] Select `fittrack_profiles`
3. [ ] Expand and inspect all profiles

### Verification:
- [ ] View raw localStorage value:
```javascript
const raw = localStorage.getItem('fittrack_profiles');
console.log('Raw localStorage:', raw);
console.log('Contains "pin":', raw.includes('"pin"'));
console.log('Contains "pinHash":', raw.includes('"pinHash"'));
console.log('Contains "pinSalt":', raw.includes('"pinSalt"'));
```

### Expected Results:
- [ ] No profile has `"pin":"1234"` or similar plaintext
- [ ] All profiles have `pinHash` field
- [ ] All profiles have `pinSalt` field
- [ ] Hash looks like long hex string (64 characters)
- [ ] Salt looks like hex string (32 characters)

**Pass Criteria**: ✅ Zero plaintext PINs found in storage

---

## Test 6: Error Handling

### Test 6a: Crypto API Unavailable (Simulation)

Skip this test - Web Crypto API required for app to function.

### Test 6b: Empty PIN
1. [ ] Go to create profile
2. [ ] Leave PIN fields empty
3. [ ] Click "Create Profile"

**Expected**: Error message "Please enter a 4-digit PIN"

### Test 6c: Short PIN
1. [ ] Enter only 3 digits: 123
2. [ ] Click "Create Profile"

**Expected**: Error message "Please enter a 4-digit PIN"

### Test 6d: Corrupted Profile (Manual)
1. [ ] Manually corrupt a profile in localStorage:
```javascript
const profiles = JSON.parse(localStorage.getItem('fittrack_profiles'));
profiles[0].pinHash = 'invalid';
localStorage.setItem('fittrack_profiles', JSON.stringify(profiles));
```
2. [ ] Try to log in

**Expected**: Error message or fallback behavior

**Pass Criteria**: ✅ All error cases handled gracefully

---

## Test 7: Multiple Profiles

### Steps:
1. [ ] Create 3 different profiles:
   - User A: PIN 1111
   - User B: PIN 2222
   - User C: PIN 3333

2. [ ] Verify each profile:
   - [ ] Has unique `pinHash`
   - [ ] Has unique `pinSalt`
   - [ ] Can log in with correct PIN
   - [ ] Cannot log in with other users' PINs

### Verification:
```javascript
const profiles = JSON.parse(localStorage.getItem('fittrack_profiles'));
console.log('Profile count:', profiles.length);
profiles.forEach((p, i) => {
  console.log(`Profile ${i}: ${p.name}`);
  console.log('  - pinHash:', p.pinHash?.substring(0, 16) + '...');
  console.log('  - pinSalt:', p.pinSalt?.substring(0, 16) + '...');
  console.log('  - Unique hash:', profiles.filter(x => x.pinHash === p.pinHash).length === 1);
  console.log('  - Unique salt:', profiles.filter(x => x.pinSalt === p.pinSalt).length === 1);
});
```

**Pass Criteria**: ✅ Each profile has unique hash and salt

---

## Test 8: PIN Change (Forgot PIN Flow)

### Steps:
1. [ ] Select a profile
2. [ ] Click "Forgot PIN?"
3. [ ] Confirm deletion

### Expected Results:
- [ ] Profile deleted
- [ ] All user data removed
- [ ] Cannot log in with old PIN
- [ ] Can create new profile with same name

**Pass Criteria**: ✅ Profile fully removed, no data leakage

---

## Test 9: Cross-Browser Test

### Browsers to Test:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (if available)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Android

### For Each Browser:
- [ ] Create new profile
- [ ] Verify PIN hashing works
- [ ] Verify login works
- [ ] Check console for errors
- [ ] Inspect localStorage format

**Pass Criteria**: ✅ Works consistently across all browsers

---

## Test 10: Performance Test

### Measure Hashing Time:
```javascript
// In browser console during profile creation:
console.time('PIN Hashing');
// Create profile
console.timeEnd('PIN Hashing');
```

### Expected Results:
- [ ] Hashing completes in < 200ms on desktop
- [ ] Hashing completes in < 500ms on mobile
- [ ] No noticeable UI lag
- [ ] No browser freezing

**Pass Criteria**: ✅ Acceptable performance on target devices

---

## Security Verification

### Manual Inspection:
1. [ ] View localStorage in DevTools
2. [ ] Copy entire `fittrack_profiles` value
3. [ ] Paste into text editor
4. [ ] Search for PINs (1234, 4321, etc.)

**Pass Criteria**: ✅ NO plaintext PINs found anywhere

### Network Check:
1. [ ] Open DevTools → Network tab
2. [ ] Create profile and log in
3. [ ] Check all network requests

**Pass Criteria**: ✅ No PINs transmitted over network (should be zero requests)

---

## Final Checklist

Before merging:
- [ ] All tests pass
- [ ] No console errors
- [ ] No plaintext PINs in localStorage
- [ ] Migration works for existing users
- [ ] Login flow unchanged from user perspective
- [ ] SECURITY.md documentation reviewed
- [ ] Code committed with proper message
- [ ] Branch pushed to remote

---

## Known Issues / Edge Cases

Document any issues found during testing:

1. Issue:
   - Reproduction steps:
   - Expected behavior:
   - Actual behavior:
   - Severity:

---

## Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. New User Creation | ⬜ Pending | |
| 2. Correct PIN Login | ⬜ Pending | |
| 3. Incorrect PIN Login | ⬜ Pending | |
| 4. Legacy Migration | ⬜ Pending | |
| 5. No Plaintext Storage | ⬜ Pending | |
| 6. Error Handling | ⬜ Pending | |
| 7. Multiple Profiles | ⬜ Pending | |
| 8. Forgot PIN | ⬜ Pending | |
| 9. Cross-Browser | ⬜ Pending | |
| 10. Performance | ⬜ Pending | |

**Overall Status**: ⬜ Not Tested

**Tester**: _______________
**Date**: _______________
**Browser**: _______________
**OS**: _______________

---

## Post-Testing Actions

After all tests pass:
- [ ] Update test results summary
- [ ] Document any workarounds needed
- [ ] Create pull request
- [ ] Request code review
- [ ] Merge to main branch
- [ ] Deploy to production
- [ ] Notify users of security update
- [ ] Monitor for issues

---

**Testing Document Version**: 1.0
**Last Updated**: 2025-11-10
