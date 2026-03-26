# PR Change Notes

**Title:**  
Navigation polish, footer fixes, and scroll restoration

**Summary:**  
Aligned footer navigation and social links to working routes, added accessible external links, and removed a dead “Upload Resume” link until the feature ships. Implemented a reusable scroll restoration helper so every route transition lands at the top (or the correct anchor) for a consistent experience across main, auth, and admin layouts. Updated hover/focus states to improve clarity without changing the site’s visual language.

## 1. Concepts
- Normalize navigation targets so every footer link and social icon resolves to a real, predictable destination.
- Restore scroll position deterministically on route changes, respecting in-page anchors when present.
- Keep disabled/placeholder links non-interactive but clearly labeled to avoid dead ends.

## 2. Real-world analogy
Think of a building directory that was missing arrows and had a few doors that opened to nowhere; this change replaces the missing arrows, locks the unusable doors with clear “coming soon” signs, and makes sure every elevator ride starts on floor 1 instead of leaving you where the last rider stopped.

## 3. Smallest practical example
Route changes now reset scroll (and handle hashes) through a tiny helper:

```jsx
// src/components/common/ScrollRestoration.jsx
useEffect(() => {
  if (hash) {
    requestAnimationFrame(() => {
      const target = document.querySelector(hash) || document.getElementById(hash.replace("#", ""));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
    return;
  }
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}, [pathname, hash]);
```

## 4. Why it exists & where it is used
- Previously, some navigation flows opened pages at the bottom or preserved stale scroll, and the footer contained a dead “Upload Resume” link plus unclickable social icons.  
- The scroll helper is used in `MainLayout`, `AuthLayout`, and `DashboardLayout`, covering public, auth, and admin routes.  
- Footer link fixes live in `TopFooter`, with link targets defined in `libs/constant.js`.

## 5. Technical trade-off
- Chose a lightweight custom scroll restoration over introducing a heavier routing plugin. It’s explicit, framework-agnostic, and easy to adjust, but future router upgrades with built-in scroll management may make this helper redundant and should be evaluated later.

## PR Information
- Frontend navigation: fixed footer link targets, disabled the unimplemented “Upload Resume” entry, improved focus/hover clarity.
- Social links: added real URLs, external-link safety (`target="_blank"` with `rel="noopener noreferrer"`), and accessible labels.
- Scroll behavior: added reusable scroll restoration across main/auth/admin layouts with anchor support.
