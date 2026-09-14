---
name: d3-visualization
description: Build, run, and debug D3.js data visualizations — selections, joins, scales, axes, SVG vs canvas, responsive resize.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# D3 Visualization

D3 specifics that trip up agents building charts.

1. **Install** — `npm install d3` (or the scoped modules `d3-selection`, `d3-scale`, `d3-shape` for a smaller bundle). Serve via a dev server/Vite — do NOT open via `file://`, ES module imports and `fetch` both fail there (see `static-frontend`, `make-it-run`).
2. **You own the DOM** — D3 has no components. Every render is `select` → `join` → set attributes; a chart that "disappears on re-render" is usually two renders appending to the same container.
3. **The join pattern** — modern D3 is a single `.join()`:
   ```js
   svg.selectAll('rect.bar')
     .data(data, d => d.id)
     .join('rect')            // enter+update+exit in one
     .attr('class', 'bar')
     .attr('x', d => x(d.name)).attr('width', x.bandwidth())
     .attr('y', d => y(d.value)).attr('height', d => y(0) - y(d.value))
   ```
   The legacy `enter()/append()/merge()/exit()/remove()` dance still works but is easy to get wrong — prefer `.join()`. **Always pass a key function** (second `data()` arg) or rows are matched by index and reordering animates the wrong bars.
4. **`selectAll` before `data` is mandatory** — `svg.data(x)` is a no-op; D3 binds data to a *selection*, so you must declare the empty selection (`selectAll('rect')`) even when no elements exist yet.
5. **Scales** — `d3.scaleLinear().domain([0, max]).range([h, 0])` (note the inverted range: SVG y grows downward), `d3.scaleBand().domain(names).range([0, w]).padding(0.1)`, `d3.scaleTime().domain(extent).range([0, w])`. Use `d3.max(data, d => d.value)` for the domain — a hardcoded max makes bars overflow silently.
6. **Axes** — `svg.append('g').attr('transform', 'translate(0,${h})').call(d3.axisBottom(x))`. Re-rendering axes without removing the previous `g.axis` stacks duplicate tick labels — either `.selectAll('g.axis').remove()` first or keep one axis group and `.call()` it again.
7. **Margins** — the conventional margin object (`{top,right,bottom,left}`) matters: draw the plot into a `<g transform="translate(left,top)">` sized `width - left - right`, or the axis labels clip at the SVG edge.
8. **SVG vs canvas** — SVG is the default (crisp, styleable, easy hit-testing via `pointer-events`), but degrades past ~1–2k elements. For scatter plots / large series use canvas with `d3.create('canvas')` + `ctx`, or add the `d3-canvas-transition`-style manual redraw — you lose CSS styling and per-element events, so hit-test with `d3.pointer`/`d3.quadtree` instead.
9. **Loading data** — `d3.csv('/data/x.csv', d3.autoType)` (parses numbers/dates for you), `d3.json('/api/x')`, or plain `fetch`. `d3.csv` returns a Promise; forgetting `await` renders an empty chart. Data from `fetch` must go through `d3.autoType` manually or values arrive as strings and `+` concatenates.
10. **Values are strings until you convert** — `d.value` from CSV is `"12"`; `d.value * 2` works but `d.value + 1` gives `"121"`. `d3.autoType` or `+d.value` is the fix.
11. **Scales are functions, ranges are arrays** — a common bug is calling `x.domain()` with a reversed array, or mapping with `x(value)` when the value type doesn't match the band domain (string vs number mismatch in `scaleBand` yields `undefined` x).
12. **Transitions** — `selection.transition().duration(500).attr(...)`. Starting a transition on a `selection` that is re-created each render cancels/interrupts it; hold onto the selection, or the animation "stutters" on data updates.
13. **Tooltips/interaction** — `selection.on('mouseover', (event, d) => ...)` (the **datum is the second arg** in D3 v6+, not `d3.event`). Use `d3.pointer(event)` for coordinates relative to an element.
14. **Responsive/resize** — recompute the viewBox or width on resize and re-run the render: `const ro = new ResizeObserver(render); ro.observe(container)`. Fixed pixel width = the chart overflows on mobile. Cheap trick: `svg.attr('viewBox', '0 0 w h').attr('preserveAspectRatio', 'xMidYMid meet')` with `width:100%` in CSS.
15. **Numbers you can sanity-check** — log `data.length`, the computed domains, and the first datum's mapped x/y before shipping; an empty selection or `NaN` in an attribute is the root cause of most "the chart is blank" reports.
16. **Server-side rendering** — D3 needs a DOM; in Node use `d3-selection` + `jsdom`, or skip D3 and emit static SVG. Rendering D3 on the server without a DOM throws `document is not defined`.
17. **Verify** — start the dev server (`npm run dev`) and drive the page with the browser tool: assert the container holds the expected count of `<svg> <rect>/<path>/<circle>` elements (`js` op), that `getBBox()`/`getBoundingClientRect()` width and height are non-zero, that the screenshot is not blank, and that the console has no errors (see `ui-verification`, `make-it-run`). Zero elements or `NaN` attributes = a data/scale bug, not a CSS bug.

## Related skills
- `css-animation` — the FLIP technique and `transform`/`opacity` motion for animating chart transitions cheaply.
- `web-animations-api` — scripted/seekable timelines when a D3 transition needs pausing, seeking, or scroll-driving.
- `sprite-animation` — canvas frame stepping when a visualisation animates beyond SVG's element budget.
- `motion-design` — easing/duration/stagger choices for chart and dashboard motion.
- `html5-apis` — `ResizeObserver`, canvas/DOM rendering, and the platform underneath D3.
- `ui-verification` / `make-it-run` — prove elements, attributes, and transitions at runtime.
