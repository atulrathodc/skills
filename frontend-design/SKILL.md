---
name: frontend-design
description: Make a frontend look GOOD, not just work — layout, spacing, color, typography, states, responsiveness. Apply to every UI you build.
allowed-tools: Read, Grep, Glob, Edit, Write
---

# Frontend Design

A working UI that looks broken is not done. Apply these rules to EVERY frontend you build, regardless of framework.

## Layout
- **Grid or flex everywhere** — nothing floats or is absolutely positioned when a flex/grid will do. `flex` for rows/columns of items, `grid` for 2D layouts. Give containers consistent padding (`1rem`/`16px` scale).
- **Visual hierarchy** — one primary action per screen (larger/brighter), secondary actions muted. The page title is the biggest text; body is smaller; captions smallest.
- **Alignment** — consistent left edges; don't center everything.

## Spacing
- **Use a spacing scale** — multiples of 4/8px (`4, 8, 12, 16, 24, 32`). Never eyeball paddings like `13px` or `17px`.
- **Group related things, gap unrelated** — related controls close together, sections separated. Consistent margins between cards/rows.

## Color
- **Pick a small palette and stick to it** — one primary, one neutral (grays), one accent, one danger. Pull from a known palette; do NOT mix arbitrary hex colors.
- **Contrast** — text must read on its background (WCAG AA ≈ 4.5:1 for body text). Never gray-on-gray or white-on-yellow.
- **Semantic color** — green = success, red = error, blue = action. Don't invert them.

## Typography
- **System font stack** (`-apple-system, Segoe UI, Roboto, sans-serif`) unless the design calls for more.
- **3-4 sizes max** — title (large), heading, body, caption. Match line-height to size.
- **Don't** use 6+ font sizes, all-caps body text, or tiny (<13px) body copy.

## States (every interactive element)
- **Hover, focus, active, disabled** — visible change for each. Focus ring for keyboard users. Disabled = dimmed + `cursor: not-allowed`.
- **Loading / empty / error** — a loading indicator, an empty-state message ("No items yet"), and inline error text near the field. A screen that goes blank while loading is broken.
- **Click targets** — at least ~40px; don't make a user aim at a 12px button.

## Responsive
- **Mobile-first** — the layout must work at ~375px. Stack columns on small screens, side-by-side on large. Never horizontal-scroll (except tables).
- **Test the narrow width** — if it breaks, it's not done.

## Consistency
- **Reusable components/tokens** — one button style, one card style, one input style. Duplicate-looking-but-different controls are a design smell.
- Match the app's existing visual language — a new page must look like the app it lives in.
- **Verify visually** — load it in a browser, check it at desktop AND mobile width, exercise the empty/error/loading states. A UI you haven't looked at isn't finished.
