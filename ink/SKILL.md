---
name: ink
description: Build, run, and debug Ink (React for CLIs) apps — components, hooks, flexbox layout, input handling, styling, and exit patterns.
allowed-tools:
  - Bash
  - Read
  - Edit
  - Write
---

# Ink

Ink builds interactive command-line apps with React. Components render to a terminal instead of the DOM.

1. **Install + entry point** — `npm install react ink` (Ink 4+ needs React 18, Node 18+). Create the app with normal React components and mount it with `import {render} from 'ink'; render(<App/>)`. `render()` returns an instance; `await instance.waitUntilExit()` resolves when the app unmounts — use it so the process doesn't exit before cleanup.
2. **`Box` = flexbox layout** — the layout component. Use `flexDirection: 'row' | 'column'`, `justifyContent`, `alignItems`, `gap`, `padding`/`margin` (a number, or `[vertical, horizontal]` / `[top, right, bottom, left]` arrays), `width`/`height` plus `minWidth`/`maxWidth`/`minHeight`/`maxHeight`, and `borderStyle` + `borderColor`. Layout that "doesn't stack" = missing `flexDirection: 'column'` on the parent.
3. **`Text` = the only way to output strings** — every visible string must live inside a `<Text>` component (directly or as a child of `Box`). Replace what you'd `console.log` with `<Text>…</Text>`. A raw string rendered through a `Box` without `Text` does not appear.
4. **Styling text** — `<Text color="green" backgroundColor="black" bold italic underline strikethrough dim inverse>`; `color` accepts named colors, hex (`#ff0000`), or rgb arrays (`[255, 0, 0]`). Wrap a group of styled children in a single `Text` to inherit styles. `visible={false}` on `Text`/`Box` hides it while keeping layout space.
5. **`newline` / blank lines** — add a blank line with `<Text>{"\n"}</Text>` or `<Newline/>`; raw newlines in JSX strings are unreliable. For progress bars/spinners that redraw, let Ink diff your tree — don't build strings manually.
6. **Keystroke input: `useInput`** — `useInput((input, key) => {})` fires per keystroke. `input` is the raw char; `key` has booleans like `key.upArrow`, `key.downArrow`, `key.leftArrow`, `key.rightArrow`, `key.return`, `key.escape`, `key.tab`, `key.backspace`, and `key.ctrl`/`key.shift`. Pass `{isActive: false}` to disable while another component has focus. The callback fires for every key — no response usually means your guard (`if (key.upArrow)`) is wrong or the hook isn't mounted.
7. **App level: `useApp`** — `{exit, unmount, focus}`. Call `exit(code)` to quit cleanly (sets the exit code), `focus()` to move focus to a component. For full line input (raw mode is one key at a time), accumulate state yourself and render the current value, or read `process.stdin`.
8. **`render` options + alternate screen** — `render(<App/>, {exitOnCtrlC: true, fullscreen: true, stdin, stdout, stderr})`. `fullscreen: true` uses the alternate screen (clears the terminal at start, restores on exit — good for TUIs, bad for logging/CI). `exitOnCtrlC: true` auto-exits on Ctrl+C instead of emitting a key; set `false` if `useInput` should handle Ctrl+C itself. Custom `stdin`/`stdout`/`stderr` let you test with buffers or a PTY.
9. **Built-in components** — `Static` renders a fixed list once (no redraw — use for scrollback/logs), `Spacer` fills remaining space, `Transform` is low-level. For selection/checkbox UIs, manage state with `useInput` and highlight the active `Text`, or use ecosystem packages like `ink-select-input`, `ink-spinner`, and `ink-text-input`.
10. **Async + exit pattern** — typical top-level: an async `main()` renders the app, then `await app.waitUntilExit()` so cleanup/exit codes happen on time; use `process.exitCode` for CI friendliness. An app that "runs forever" = `exit()`/`waitUntilExit` never triggers; one that "exits instantly" = you never `await waitUntilExit` or `Static` renders nothing to keep it alive.
11. **Verify** — build with `npm run build` (or `tsc`/your bundler), then run the CLI in a TTY. For automated checks, pipe static input through an echo/PTY and assert on stdout/stderr; run a non-interactive subcommand that prints and exits. Confirm `Box`/`Text` hierarchy renders expected lines, colors/styles appear, and `exitOnCtrlC`/`exit()` terminate with the right code. CI without a TTY can still run apps that exit on their own.
