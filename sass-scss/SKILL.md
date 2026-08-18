---
name: sass-scss
description: Write and build Sass/SCSS — variables, nesting, mixins, and the compile step that must run for styles to appear.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Sass / SCSS

Sass specifics.

1. **It's a build step** — `.scss` does NOT run in the browser; it must compile to `.css`. Find the build: Vite/Webpack `sass`/`dart-sass`/`sass-loader`, or `sass input.scss output.css`. If styles "don't apply", the compile didn't run or the page links the wrong file.
2. **Variables** — `$color-primary: #...;` used as `color: $color-primary`. A "undefined variable" = not defined in this file's scope (or imported before use).
3. **Nesting** — `.card { .title { ... } &:hover { ... } }`. `&` is the parent selector. A selector that "matches nothing" = the nesting produces a different structure than the HTML.
4. **Mixins/extends** — `@mixin flex($dir)` + `@include flex(row)` for reusable rules. Keep them local to the design system.
5. **Imports** — `@use 'variables'` (new, scoped) vs `@import` (deprecated). A missing symbol = the `@use` namespace isn't referenced (`variables.$color`).
6. **Compile order** — the compiled CSS must come AFTER the HTML element it styles; a `@use`d partial is compiled where imported. See `frontend-design` for the design rules to encode here.
7. **Verify** — confirm the compiled `.css` contains the new rule (Grep the output) and the page links it.
