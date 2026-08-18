---
name: bootstrap-css
description: Style a frontend with Bootstrap — grid, components, utility classes, and CDN vs build wiring.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Bootstrap CSS

Bootstrap specifics.

1. **Two ways to load it** — CDN (`<link>` + `<script>` in the HTML — no build) or the Sass/import build. The CDN path is the fastest for a static page; a build path needs the Sass compilation (see `sass-scss`). Match what the project already does.
2. **Grid** — `container` > `row` > `col-md-6` (12-column). A column that "doesn't stack" = no `row`, or the breakpoint is wrong (`col-6` is always 6; `col-md-6` is 6 only at `md`+).
3. **Components** — `btn btn-primary`, `card`, `navbar`, `modal`, `form-control`, `table table-striped`. Copy the documented class combo; a missing part (e.g. `btn` alone) renders unstyled.
4. **Utilities** — `d-flex`, `mt-3`, `p-2`, `text-center`, `w-100` (see `frontend-design` for when to reach for them).
5. **Interactions need JS** — modals/dropdowns/tooltips need Bootstrap's JS bundle + `data-bs-*` attributes. A modal that doesn't open = the bundle isn't loaded or the `data-bs-target` id is wrong.
6. **Version matters** — Bootstrap 5 (no jQuery, `data-bs-*`) vs 4 (`data-*`, jQuery). Mixing syntax silently does nothing — match the loaded version.
7. **Verify** — curl the page, confirm the CSS/JS bundle loads (see `ui-verification`), and the component classes render.
