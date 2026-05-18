# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# database
- Replace Supabase with Neon DB (via Vercel) for database access. Remove Supabase imports/dependencies from frontend when encountered. Focus on frontend only, do not modify backend. Confidence: 0.75

# frontend
- Use TanStack Query optimistic updates (onMutate with cancelQueries + setQueryData, onError rollback, onSuccess invalidate) for all mutations — use onSuccess NOT onSettled to avoid refetching after errors. apply to createGroup, addTask, toggleTask, and any future mutations. Confidence: 0.85
- Use `onClick={onClose}` on modal backdrop overlay div + `e.stopPropagation()` on inner content div for dismiss-on-backdrop-click behavior on all sheets/modals. Confidence: 0.75

# deployment
- Add `vercel.json` with `{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}` to client projects for SPA routing fallback on Vercel static hosting. Confidence: 0.70
- For cross-domain cookie auth on Vercel: set `sameSite: 'none'` + `secure: true` on cookies, use exact `CORS_ORIGIN` env var matching the client URL, and `withCredentials: true` on the API client. Confidence: 0.75
- Use NODE_ENV-conditional logic for server cookie and CORS settings: in development use `secure: false`, `sameSite: 'lax'`, and localhost CORS fallbacks; in production use `secure: true`, `sameSite: 'none'`, and explicit `CORS_ORIGIN`. Confidence: 0.70
- When clearing auth cookies on logout, match the exact same cookie flags (secure, sameSite, httpOnly) used when setting them — mismatched flags cause iOS WKWebView to not clear the cookie. Confidence: 0.70

# typescript
- In Express 5 with strict TypeScript, `req.params.id` returns `string | string[]` — always cast with `as string` before passing to ORM queries. Use `req.user!.id` (non-null assertion) after auth middleware since middleware guarantees user exists. Confidence: 0.70

# pwa
- For PWA on mobile: add `interactive-widget=resizes-content` and `viewport-fit=cover` to viewport meta tag, use `pb-24` on layout for fixed bottom nav, and use `env(safe-area-inset-bottom)` for notched device padding. Also apply `env(safe-area-inset-top)` via `calc()` on the layout wrapper top padding for iOS notch/Dynamic Island clearance. Confidence: 0.70
- In PWA standalone mode on iOS, avoid relying on `/auth/me` roundtrip after login — set user state directly from the login/register API response using a `setUser` function in the AuthContext. Confidence: 0.70

# service-worker
- For PWA service worker runtime caching: use NetworkOnly for auth endpoints (/api/auth/*), StaleWhileRevalidate with method:'GET' and cacheableResponse:{statuses:[200]} for data API GETs — never cache POST/PATCH/DELETE mutations, never cache error responses like 401/500. Confidence: 0.75

# react-query
- Add retry: false to useMutation for POST/PATCH/DELETE (non-idempotent) — iOS keyboard dismissal can cause request timeouts and retrying creates duplicates. Confidence: 0.75
- Disable refetchOnWindowFocus in QueryClient defaultOptions for PWA apps — iOS keyboard events trigger window focus and cause spurious refetches during mutations. Confidence: 0.70

# mobile-ui
- Bottom sheet panels must have max-h-[90vh] overflow-y-auto to prevent content overflowing off-screen on small phones — apply to all sheets/modals with dynamic content. Confidence: 0.75

# animation
- Add smooth enter/exit transitions on sheets and modals (do not let them appear/disappear instantly). Use a keep-mounted-during-exit pattern: mount on open, set visible via `requestAnimationFrame`, set hidden on close with a 200ms `setTimeout` delay before unmounting. Use `transition-opacity duration-200` on backdrop overlay and `transition-all duration-200` with `translate-y-4` slide + opacity on the content panel. Confidence: 0.70

