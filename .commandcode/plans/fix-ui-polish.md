# Fix: iOS Header Spacing, Sheet Transitions, History Label, Desktop Nav

## Issues Found

### 1. Header Too Close to Top on iOS PWA
`AppHeader.tsx` uses `pt-10` (40px) — not enough for iOS notch/Dynamic Island (47-59px). No `safe-area-inset-top` handling anywhere in the app — only bottom safe area is handled (nav bar, sheets).

### 2. ProfileSheet Appears Instantly (No Transition)
`ProfileSheet.tsx` does `if (!open) return null;` — DOM unmounts/mounts instantly with zero animation.

### 3. History Date Label Positioning
The date label ("Today" / "Yesterday") in `history.tsx` renders twice:
- Inside the `<select>` dropdown between arrows and calendar (line 120-145)
- As a separate `<h2>` below the navigation bar (line 157-159)

The label below is outside the nav container — visually sits below the arrows/calendar row, not between them. In web mode the `<select>` dropdown renders the label between arrows, but in PWA the native `<select>` rendering on iOS may truncate or not show the label clearly.

### 4. Bottom Nav Hidden on Desktop
`_authenticated.tsx` line 32 has `md:hidden` on the `<nav>` — hides the bottom nav on screens ≥768px. Desktop users have no way to navigate between dashboard and history.

## Fix Plan

### Fix 1: iOS Safe Area Top Padding

**File**: `client/src/routes/_authenticated.tsx` — apply `safe-area-inset-top` on the layout wrapper so ALL authenticated pages benefit from the spacing, not just the header:

```tsx
<div 
  className="min-h-screen bg-zinc-950 pb-24"
  style={{ paddingTop: "calc(2.5rem + env(safe-area-inset-top))" }}
>
```

On non-iOS / desktop, `env(safe-area-inset-top)` returns `0` — no effect. Using `2.5rem` base (same as current `pt-10`) + the inset.

Then remove `pt-10` from `AppHeader.tsx` since the layout wrapper now provides the top spacing:

```tsx
<header className="flex items-center justify-between pb-4">
```

### Fix 2: ProfileSheet & NewGroupSheet Transitions

Both sheets use the same pattern: backdrop + bottom sheet. Add CSS transitions using a keep-mounted-during-exit pattern:

**ProfileSheet.tsx** changes:
```tsx
// Replace: if (!open) return null;
// With mount/unmount animation state:
const [mounted, setMounted] = useState(false);
const [visible, setVisible] = useState(false);

useEffect(() => {
  if (open) {
    setMounted(true);
    requestAnimationFrame(() => setVisible(true));
  } else {
    setVisible(false);
    const timer = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(timer);
  }
}, [open]);

if (!mounted) return null;

// Backdrop: opacity transition
<div className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}>

// Sheet panel: translate-y + opacity
<div className={`w-full max-w-md rounded-t-2xl bg-card p-6 hairline md:rounded-2xl transition-all duration-200 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
```

**NewGroupSheet.tsx** — same pattern (same structure, same transition).

### Fix 3: History Date Label — Remove Redundant H2

The `<select>` dropdown already shows "Today" / "Yesterday" / formatted date as its visible value between the arrows and calendar icon. The `<h2>` below is redundant.

Remove the `<h2>` date label block (lines 157-159) and keep only the completed count below the nav bar:

```tsx
{/* After the nav bar div, only show completed count */}
<div className="flex items-center justify-between mb-4">
  <span /> {/* spacer */}
  {!isLoading && (
    <span className="text-sm text-muted-foreground">
      {completedCount} task{completedCount !== 1 ? "s" : ""} completed
    </span>
  )}
</div>
```

### Fix 4: Show Bottom Nav on Desktop

**File**: `client/src/routes/_authenticated.tsx` — remove `md:hidden` from the `<nav>` element. The nav stays visible at all screen sizes:

```tsx
<nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900 border-t border-white/10 px-6 pt-3" ...>
```

## Files to Change

| File | Changes |
|------|---------|
| `client/src/routes/_authenticated.tsx` | Add `safe-area-inset-top` padding to wrapper, remove `md:hidden` from nav |
| `client/src/components/daylog/AppHeader.tsx` | Remove `pt-10` (now handled by layout wrapper) |
| `client/src/components/daylog/ProfileSheet.tsx` | Add mount/visible animation state, backdrop + panel transition classes |
| `client/src/components/daylog/NewGroupSheet.tsx` | Same transition pattern as ProfileSheet |
| `client/src/routes/_authenticated/history.tsx` | Remove redundant `<h2>` date label block |

## Verification

1. **Header spacing**: Open PWA on iOS — greeting "Good morning, Name" sits below the notch/Dynamic Island with comfortable spacing
2. **Profile sheet**: Tap profile avatar — sheet slides up with backdrop fade-in. Close — slides down with fade-out (200ms)
3. **New goal sheet**: Same smooth slide transition
4. **History label**: Date shows in `<select>` between arrows and calendar. Completed count below. No duplicate
5. **Desktop nav**: Bottom navigation (Dashboard / History) visible and functional on desktop browsers
