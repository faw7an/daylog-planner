# Fix: iOS Login Stuck, Status Bar Theme, and PWA Icons

## Root Causes Found

### 1. iOS Login Stuck (Critical)
The login (and register) flow has a **race condition** between `setUser()` and `window.location.replace()`:

`client/src/routes/login.tsx` (lines 31-33):
```ts
setUser(res.data);
toast({ title: "Signed in", description: "Welcome back!" });
window.location.replace("/dashboard");
```

The iOS PWA/browser intercepts the `window.location.replace()` call and fires it, but the cookie set by the server hasn't been fully stored by the browser yet. On iOS Safari / WKWebView, `document.cookie` writes from `Set-Cookie` headers can be asynchronous. When `/dashboard` loads, `useAuth` calls `GET /auth/me` — but the cookie isn't set yet, so it returns 401, `user` stays `null`, and `_authenticated.tsx` redirects back to `/login`. The user sees the toast but stays on login.

**Root cause**: `window.location.replace()` on iOS fires before the cookie from the login response is actually available. The `setUser` and `useEffect` redirect patterns are also conflicting — there's both a manual `window.location.replace` AND a `useEffect` watching `user` that does the same thing.

The same pattern exists in `register.tsx` (lines 33-34).

### 2. Status Bar Background Color
`index.html` sets `<meta name="theme-color" content="#7c3aed" />` (purple). The app's actual background is `#0f0f0f` (near-black) as defined in `styles.css` and `vite.config.ts`'s `background_color: '#0f0f0f'`.

The `theme_color` in both `vite.config.ts` and `manifest.json` should match the app's background (`#0f0f0f` or `#09090b`), not the accent color. The purple accent creates a jarring mismatch between the browser chrome and the dark app UI.

Additionally, `apple-mobile-web-app-status-bar-style` is set to `black-translucent` — this should be `black` since the content area is dark (`bg-zinc-950`). `black-translucent` lets content bleed through the status bar, which may look wrong depending on the scroll position.

### 3. PWA Icons Not Loading on iOS
The `index.html` links to `/favicon.ico` and `/apple-touch-icon.png` — but iOS requires Apple-specific meta tags for proper icon setup. Missing:
- No `180x180` size specification for `apple-touch-icon`
- No `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">` (just `href` without `sizes` attribute)
- The `/icon-192.png` and `/icon-512.png` referenced in `manifest.json` need to be verifiable — the `public/` directory has them but iOS may ignore the manifest since it reads the HTML link tags

## Fix Plan

### Fix 1: iOS Login Stuck — Remove Race Condition

**File**: `client/src/routes/login.tsx`

Change the login success flow from:
```ts
setUser(res.data);
toast({ title: "Signed in", description: "Welcome back!" });
window.location.replace("/dashboard");
```

To:
```ts
// Remove direct window.location.replace — let the useEffect handle navigation
setUser(res.data);
```

Wait — but there's a taste preference: "In PWA standalone mode on iOS, avoid relying on `/auth/me` roundtrip after login — set user state directly from the login/register API response using a `setUser` function in the AuthContext." So we need to keep `setUser(res.data)`.

However, the `setUser` in `useAuth` only sets local state — it doesn't verify the cookie. The problem is the `_authenticated` layout's `useEffect` that calls `navigate({ to: "/login" })` when `user` is still `null` from the initial load.

**Actual fix**: Remove `window.location.replace()` from the login handler. Instead, let the `useEffect` already on line 24-27 handle redirecting when `user` becomes non-null:

```tsx
useEffect(() => {
  if (!loading && user) {
    window.location.replace("/dashboard");
  }
}, [user, loading]);
```

But this also uses `window.location.replace`. The TanStack Router way is to use `navigate()` from `useNavigate()`. However, we need to be careful: after `setUser`, the state update is batched, so the `useEffect` fires on the next render. The `_authenticated` layout also has its own redirect logic. There's a conflict.

**Better fix — use TanStack Router's `navigate` with `replace: true`**:

In `login.tsx`:
```tsx
import { useNavigate } from "@tanstack/react-router";

const navigate = useNavigate();

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoadingLogin(true);
  try {
    const res = await api.post("/auth/login", { email, password });
    setUser(res.data);
    toast({ title: "Signed in", description: "Welcome back!" });
    // Small delay to ensure cookie is set on iOS
    await new Promise(r => setTimeout(r, 100));
    navigate({ to: "/dashboard", replace: true });
  } catch (err: any) {
    // ...existing error handling
  } finally {
    setLoadingLogin(false);
  }
};
```

And remove the `useEffect` that watches `user` (lines 24-27) — having both is redundant and causes the double-navigation.

**Same fix needed in `client/src/routes/register.tsx`** — same pattern.

### Fix 2: Status Bar Theme Color

**File**: `client/index.html`

Change:
```html
<meta name="theme-color" content="#7c3aed" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

To:
```html
<meta name="theme-color" content="#09090b" />
<meta name="apple-mobile-web-app-status-bar-style" content="black" />
```

Note: `#09090b` is Tailwind's `zinc-950` which matches the app's `bg-zinc-950` background. The `--background` CSS variable resolves to `oklch(0.16 0 0)` which is approximately `#0f0f0f`, but the pages actually use `bg-zinc-950` which is `#09090b`. They should be consistent. Let's use `#09090b` since that's what the actual page containers use.

**File**: `client/vite.config.ts`

Change `theme_color` in the PWA manifest from `#7c3aed` to `#09090b`.

**File**: `client/public/manifest.json`

Change `theme_color` from `#7c3aed` to `#09090b`.

`background_color` is already `#0f0f0f` which is close enough (matches the CSS `--background` variable), but for full consistency change to `#09090b` too.

### Fix 3: PWA Icons on iOS

**File**: `client/index.html`

Change the apple-touch-icon link from:
```html
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

To:
```html
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

iOS requires the `sizes` attribute to properly recognize the icon. Without it, Safari may fall back to a screenshot icon or show nothing.

Also verify that the actual PNG file exists at `public/apple-touch-icon.png` — it does (found 54 icon files in public/).

Optionally, add the `icon-512.png` as a second `apple-touch-icon` for iPads:
```html
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
```

## Files to Change

| File | Changes |
|------|---------|
| `client/src/routes/login.tsx` | Remove `window.location.replace`, add `navigate`, add 100ms delay, remove duplicate `useEffect` |
| `client/src/routes/register.tsx` | Same as login.tsx |
| `client/index.html` | Fix `theme-color`, `apple-mobile-web-app-status-bar-style`, add `sizes` to apple-touch-icon |
| `client/vite.config.ts` | Change `theme_color` from `#7c3aed` to `#09090b` |
| `client/public/manifest.json` | Change `theme_color`, `background_color` to `#09090b` |

## Verification

1. **Login fix**: On iOS Safari and PWA standalone, log in with valid credentials. Should see "Signed in" toast then navigate to `/dashboard` without bouncing back to `/login`.
2. **Register fix**: Same test with registration flow.
3. **Status bar**: Open the app — the browser/PWA status bar should be dark (`#09090b`) matching the app background, not purple.
4. **Icons**: After reinstalling the PWA on iOS, verify the app icon appears correctly on the home screen instead of a generic or blank icon.
