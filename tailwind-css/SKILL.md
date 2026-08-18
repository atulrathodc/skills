---
name: tailwind-css
description: Style a frontend with Tailwind CSS — utility classes, responsive prefixes, custom theme, and when it won't load.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Tailwind CSS

Tailwind specifics.

1. **Setup** — Tailwind is a build step (not a runtime CSS file). It scans source for class names and emits ONLY the utilities it finds. Wiring: `tailwind.config.js` `content: ['./src/**/*.{html,js,jsx,ts,tsx}']` + the `@tailwind` directives in your CSS entry. If a class "doesn't work", the file with it isn't in `content` (or the build didn't re-run).
2. **Utility-first** — `flex items-center justify-between p-4 rounded-lg shadow` etc. Compose from utilities instead of writing custom CSS. See `frontend-design` for the design rules these utilities express.
3. **Responsive** — breakpoint prefixes `sm:` `md:` `lg:` `xl:`: `md:grid-cols-2` = 2 columns at `md`+. Design mobile-first (no prefix = base).
4. **States** — `hover:` `focus:` `active:` `disabled:` `group-hover:`; a style that doesn't apply on hover = the prefix or nesting is wrong.
5. **Theme** — define colors/spacing/fonts in `theme.extend` in `tailwind.config`; a custom color that "doesn't exist" = it's not defined in the theme.
6. **Dark mode** — `dark:` classes need `darkMode: 'class'` and a `.dark` class on the root; without it `dark:` silently does nothing.
7. **Verify** — after the build, the class must be present in the emitted CSS (Grep the output); a missing class = scan config or a purge/`content` misconfig.
