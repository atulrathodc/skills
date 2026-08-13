---
name: accessibility
description: Keep UI changes usable for assistive technologies and keyboard-only users.
allowed-tools: Read, Grep, Glob
---

# Accessibility

For UI changes:

- Preserve semantic elements (button, link, heading, label) over generic divs.
- Ensure every interactive control is keyboard-reachable and operable.
- Add visible focus states — never remove outlines without a replacement.
- Provide text alternatives: alt text, or an aria-label where no label is visible.
- Maintain contrast between text and its background.
- Announce dynamic changes with aria-live where content updates asynchronously.
- Test with a screen reader or an automated axe scan before finishing.
- Do not rely on color alone to convey meaning.
