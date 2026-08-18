---
name: css-in-js
description: Style component UIs with CSS-in-JS — styled-components/emotion/CSS Modules — scoped styles, themes, and class-name gotchas.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# CSS-in-JS

CSS-in-JS (styled-components, emotion, CSS Modules) specifics.

1. **Know which one the app uses** — Grep for `styled-components`, `@emotion`, or `*.module.css`. Each has a different API; match the existing one.
2. **styled-components/emotion** — `const Title = styled.h1\`color: red\``; the generated class is hashed, so styles are scoped and can't leak. A style that "doesn't apply" = the styled component wraps the WRONG element, or a parent's specificity overrides it.
3. **CSS Modules** — `import styles from './X.module.css'` then `className={styles.title}`. The `styles` object keys are the class names; a typo `styles.titl` = `undefined` class = no style (silent). Grep the CSS file to confirm the class exists.
4. **Dynamic styles** — emotion/styled accept props: `` styled.div`color: ${p => p.active ? 'green' : 'grey'}` ``. A style that doesn't react = the prop isn't passed or isn't read.
5. **Theme** — `ThemeProvider` (styled-components/emotion) provides `theme` to components; a `theme.colors.x` that's undefined = the theme doesn't define `x`.
6. **Scoping is the point** — don't fight it with `!important`; fix the component that owns the style.
7. **Verify** — the style must appear in the served CSS/bundle and the element must use the generated class (browser check — see `ui-verification`).
