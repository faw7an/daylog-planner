# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# database
- Replace Supabase with Neon DB (via Vercel) for database access. Remove Supabase imports/dependencies from frontend when encountered. Focus on frontend only, do not modify backend. Confidence: 0.75

# frontend
- Use TanStack Query optimistic updates (onMutate with cancelQueries + setQueryData, onError rollback, onSettled invalidate) for all mutations to feel instant — apply to createGroup, addTask, toggleTask, and any future mutations. Confidence: 0.80
- Use `onClick={onClose}` on modal backdrop overlay div + `e.stopPropagation()` on inner content div for dismiss-on-backdrop-click behavior on all sheets/modals. Confidence: 0.75

# deployment
- Add `vercel.json` with `{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}` to client projects for SPA routing fallback on Vercel static hosting. Confidence: 0.70
- For cross-domain cookie auth on Vercel: set `sameSite: 'none'` + `secure: true` on cookies, use exact `CORS_ORIGIN` env var matching the client URL, and `withCredentials: true` on the API client. Confidence: 0.75

# typescript
- In Express 5 with strict TypeScript, `req.params.id` returns `string | string[]` — always cast with `as string` before passing to ORM queries. Use `req.user!.id` (non-null assertion) after auth middleware since middleware guarantees user exists. Confidence: 0.70

