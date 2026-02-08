# Specification

## Summary
**Goal:** Redo the primary login button styling on the Landing/Login page to better match a modern, premium dark-mode UI without changing any login behavior.

**Planned changes:**
- Update only the primary login `<Button>` under the “Login Button” comment in `frontend/src/pages/LandingLoginPage.tsx` with improved dark-mode styling (prominent fill such as subtle gradient/high-contrast, stronger shadow/glow).
- Add clear visual states for hover/active/disabled while keeping existing click handler, label logic (“Connecting...” vs “Get Started”), and disabled-while-logging-in behavior unchanged.

**User-visible outcome:** The Landing/Login page’s primary “Get Started” button looks more premium and visually prominent in dark mode, with obvious hover/active feedback and a distinct disabled appearance, while logging in continues to work exactly as before.
