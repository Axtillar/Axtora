# Axtora — Production Readiness Changes

## Summary

This document describes every change made to prepare Axtora for production. All changes are backward-compatible with existing user data (migration paths are included where fields changed).

---

## 🔐 Security — Critical

### 1. Password hashing: `btoa` → SHA-256 (Web Crypto API)

**Files:** `src/lib/hash.ts` (new), `src/store/auth-store.ts`

**Problem:** Passwords were stored as `btoa(password)` — base64 encoding, not encryption. Anyone with localStorage access could instantly recover all passwords with `atob(stored)`.

**Fix:** All passwords and PINs are now hashed with SHA-256 + a fixed application salt via `crypto.subtle.digest`. The hash is one-way and irreversible.

```ts
// Before (INSECURE)
password: btoa(password)

// After (secure)
passwordHash: await hashSecret(password)  // SHA-256 salted hash
```

**Migration:** On first login after upgrade, legacy `btoa`-encoded passwords are detected via `isHashed()` (checks if value is a 64-char hex string), verified against the legacy encoding, then automatically re-hashed and saved. Users do not need to change their passwords.

### 2. PIN hashing: `btoa` → SHA-256

**File:** `src/components/settings-section.tsx`, `src/store/auth-store.ts`

**Problem:** PINs stored as `btoa(pin)` — trivially reversible.

**Fix:** PINs now use `setPin(pin)` which hashes with SHA-256 before storage. Field renamed from `pin` to `pinHash` in `UserProfile`. Verification uses `verifyPin(pin)` (async). Legacy `btoa` PINs are detected on verify and handled with the same migration path.

### 3. Security headers added

**File:** `next.config.ts`

Added HTTP security headers for all routes:
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `X-Frame-Options: DENY` — blocks clickjacking
- `X-XSS-Protection: 1; mode=block` — legacy XSS filter
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — disables camera, mic, geolocation

---

## 🐛 Bug Fixes

### 4. Removed global `window` pollution in onboarding

**File:** `src/components/onboarding-flow.tsx`

**Problem:** Child steps registered their save callbacks by writing to `window.__onboardingWorkspaceNext` and `window.__onboardingPrefsNext`. This is a global namespace pollution antipattern that breaks in strict environments, SSR, and multiple component instances.

**Fix:** Replaced with a `useRef` + prop-based callback registration pattern. Each step receives an `onRegisterSave` prop and calls it with a stable `useCallback`-wrapped handler. The parent reads the ref on `handleNext`.

```ts
// Before (BROKEN PATTERN)
;(window as any).__onboardingWorkspaceNext = handleNext

// After (correct)
const workspaceSaveRef = useRef<(() => void) | null>(null)
// Child calls: onRegisterSave(handleSave)
// Parent calls: workspaceSaveRef.current?.()
```

### 5. Async auth methods propagated to all call sites

**Files:** `src/components/login-page.tsx`, `src/components/signup-page.tsx`

`login()` and `signup()` are now `async` (required for `crypto.subtle`). All call sites updated to `await` them, removing the old `setTimeout(..., 300)` workaround. Error handling uses `try/catch/finally` rather than manual `setIsLoading(false)` in each branch.

---

## 🏗️ Code Quality

### 6. TypeScript strictness restored

**File:** `next.config.ts`

```ts
// Before
typescript: { ignoreBuildErrors: true }

// After — removed entirely (TypeScript errors now fail the build)
```

This was masking real type errors. All type issues have been fixed (see items above).

### 7. React Strict Mode enabled

**File:** `next.config.ts`

```ts
// Before
reactStrictMode: false

// After
reactStrictMode: true
```

Strict Mode catches double-invocation bugs, deprecated lifecycle usage, and side-effect issues in development.

### 8. Typed `partialize` in finance store

**File:** `src/store/finance-store.ts`

```ts
// Before
partialize: (state: any) => { ... }

// After
partialize: (state: FinanceState) => { ... }
```

### 9. Typed `partialize` in auth store

**File:** `src/store/auth-store.ts`

```ts
type PersistedAuthState = Omit<AuthState, "_hasHydrated">

partialize: (state: AuthState): PersistedAuthState => { ... }
```

### 10. Backup checksum no longer uses btoa

**File:** `src/components/settings-section.tsx`

```ts
// Before
checksum: btoa(JSON.stringify(data).length.toString())

// After
checksum: JSON.stringify(data).length.toString(16)  // hex length, no encoding needed
```

---

## ⚡ Performance

### 11. Package import optimization

**File:** `next.config.ts`

```ts
experimental: {
  optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
}
```

Reduces bundle size by tree-shaking icon packages at build time.

### 12. Standalone output mode

**File:** `next.config.ts`

```ts
output: "standalone"
```

Produces a minimal Node.js server bundle for Docker/VPS deployments. The existing `package.json` build script already copies static assets for this output mode.

---

## 📁 New Files

| File | Purpose |
|------|---------|
| `src/lib/hash.ts` | Canonical SHA-256 hashing via Web Crypto API. Used by auth store for all secret storage. |
| `PRODUCTION.md` | This document. |

---

## 🔄 Data Migration Notes

Existing users are **not** affected:

- **Passwords:** Auto-migrated on first login. No action required.
- **PINs:** Auto-migrated on first PIN verify. No action required.
- **Finance data:** No schema changes in finance store.
- **localStorage keys:** Unchanged (`axtora-auth`, `axtora-v6`).

---

## ✅ Pre-deploy Checklist

```bash
# Install dependencies
bun install

# Type-check (should now pass cleanly)
npx tsc --noEmit

# Lint
bun run lint

# Build
bun run build

# Test locally
bun run start
```
