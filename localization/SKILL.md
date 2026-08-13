---
name: localization
description: Externalize user-facing strings so text can be translated.
allowed-tools: Read, Grep, Glob
---

# Localization

For user-facing text:

- Follow the repo's existing i18n mechanism — do not invent a new one.
- Externalize strings into the message catalog; keep keys and placeholders stable.
- Never hardcode user-facing strings in components or logic.
- Build messages with placeholders, not string concatenation.
- Keep each key's arguments stable so existing translations stay valid.
- Use the locale API for pluralization, dates, and number formatting.
- Confirm a fallback locale is set so untranslated keys still render.
