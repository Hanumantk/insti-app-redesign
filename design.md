# Design — Insti App (redesign)

A locked design system for the iterated Insti App. Every screen reads this file
before emitting code. Do not regenerate per screen — amend this file when the
system needs to grow.

The Figma-faithful build is in [Hanumantk/insti-app-figma](https://github.com/Hanumantk/insti-app-figma). This version keeps
the Insti App **tone** (Insti blue on a cool near-white page, the lotus wordmark,
friendly pill actions) and re-engineers the structure around the main job:
**GSHA and GSec reviewing events on a laptop.**

## Genre
modern-minimal (product UI). One accent, quiet surfaces, type carries hierarchy.

## Screen families
- **Review workspace** (GSHA "Event status", GSec "Event Approvals") — master–detail:
  queue list left (status filter + search), detail panel right. No footer.
  Inline decisions, optimistic approve with Undo, keyboard J/K · A · R · E.
- **Browse** (Recommended home, all roles) — Ecosystem index: one recommended
  feature, then rows by type (Events, Competitions) with arrows + scroll-snap.
  Filters and Announcements open as right-hand sheets.
- **Detail** (event page) — split: poster sticky left, details scroll right.
  Role-aware action bar shares the review panel's component.
- **Form** (create / edit) — split like Detail: poster drop zone left, labelled
  fields right, sticky action bar.
- **Gate** (loading, log in) — centred card on paper with the brand squiggles.

## Theme (custom — anchored on the existing brand)
- `--color-paper`        oklch(97.6% 0.012 262)   ≈ #F4F8FF (unchanged)
- `--color-surface`      oklch(99.6% 0.003 262)   cards, panels, inputs
- `--color-surface-2`    oklch(95.6% 0.016 262)   hover / selected-row base
- `--color-ink`          oklch(23% 0.025 262)     headings
- `--color-ink-2`        oklch(36% 0.022 262)     body
- `--color-muted`        oklch(50% 0.02 262)      meta text (≥ 4.5:1 on paper)
- `--color-rule`         oklch(91% 0.014 262)     hairlines, card borders
- `--color-rule-strong`  oklch(66% 0.02 262)      input borders (≥ 3:1)
- `--color-accent`       oklch(55.3% 0.182 262.5) ≈ #306FDC Insti blue (unchanged)
- `--color-accent-strong`oklch(47% 0.19 263)      accent hover / pressed
- `--color-accent-tint`  oklch(94.5% 0.03 262)    ≈ #E8F1FF selected / active nav
- `--color-accent-ink`   oklch(99.5% 0.004 262)   text on accent
- `--color-focus`        oklch(47% 0.19 263)      2px ring, 2px offset
- Status (text / tint / border) — always paired with an icon + word, never colour alone:
  - approved `oklch(45% 0.12 150)` / `oklch(96% 0.035 150)` / `oklch(72% 0.13 150)`
  - rejected `oklch(50% 0.19 27)`  / `oklch(96.5% 0.022 27)` / `oklch(74% 0.13 27)`
  - pending  `oklch(48% 0.105 70)` / `oklch(96.5% 0.045 90)` / `oklch(80% 0.13 85)`
- `--color-badge`        oklch(54% 0.2 27)        count badges (white text ≥ 4.5:1)
- `--color-night`        oklch(25% 0.015 262)     footer band (text `--color-night-ink`)

Accent appears on: primary buttons, active nav pill, selected queue row tint,
links, focus. Nowhere else. Cards lose the old border + blue-glow double layer —
one `--color-rule` border; a soft shadow only on hover for clickable cards.

## Typography
- **Neue Montreal** for everything (display, UI, body) — Regular 400 / Medium 500 / Bold 700.
  Helvetica Neue is dropped (two near-identical grotesques → one).
- **DM Sans ExtraBold** survives only inside the wordmark.
- Headings are roman; tracking −0.01em on ≥ 28px.
- Dates, times and counts use `font-variant-numeric: tabular-nums`.
- Scale: 12 · 14 · 16 · 18 · 22 · 28 · 36 · 44 (`--text-xs` … `--text-display`).
- Body 16/24; meta 14/20; never below 12.

## Spacing
4-point named scale (`--space-1` 4px … `--space-16` 64px) in `src/styles/tokens.css`.
Page gutter: `clamp(16px, 4vw, 48px)`; content max-width 1440px.

## Radii
card 16 · panel 20 · input 10 · tile 12 · pill 999. Buttons are pills (tone kept).

## Motion
- Easings: `--ease-out` cubic-bezier(0.16, 1, 0.3, 1) · `--ease-in` cubic-bezier(0.7, 0, 0.84, 0).
- Durations: 120 (press) · 160 (hover / colour) · 240 (sheet open) · 180 (sheet close).
- Primitives used (max three): sheet slide-in · card hover shadow · toast slide.
- `prefers-reduced-motion`: opacity only, ≤ 150ms.

## Microinteractions stance
- Silent success, except Approve (the row leaves the Pending queue, so the
  effect is hidden) → toast "Approved · Undo" for 6s.
- Reject is never a modal: an inline required reason field in the panel.
- No confirmation dialogs (every decision is reversible).
- Focus rings instant; hover only inside `@media (hover: hover)`.

## CTA voice
- Primary: filled accent pill, 40px (44px on touch), Medium 15px, verb-first
  ("Approve", "Send rejection", "Submit for approval", "Publish").
- Secondary: surface pill with `--color-rule-strong` border.
- Destructive-ish (Reject): danger text on danger tint, same pill.

## Per-screen allowances
- Browse may show posters large; everything else uses posters as thumbnails.
- Review workspace has no footer; Browse and Detail use the compact night band.
- No eyebrows, no numbered section labels, no gradients, no glass.

## What screens MUST share
Wordmark · top bar · accent + its placement · Neue Montreal · pill CTA voice ·
status pill component (icon + word) · `EventMeta` date/venue rows.

## Exports

### tokens.css
See `src/styles/tokens.css` (the single source; Tailwind maps to these vars in
`tailwind.config.js`).

### DTCG `tokens.json` (subset)
```json
{
  "color": {
    "paper":  { "$value": "oklch(97.6% 0.012 262)", "$type": "color" },
    "ink":    { "$value": "oklch(23% 0.025 262)",   "$type": "color" },
    "accent": { "$value": "oklch(55.3% 0.182 262.5)", "$type": "color" }
  },
  "font": {
    "body":    { "$value": "Neue Montreal", "$type": "fontFamily" },
    "display": { "$value": "Neue Montreal", "$type": "fontFamily" }
  }
}
```
