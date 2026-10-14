/** @type {import('tailwindcss').Config} */
// Every value maps to a token in src/styles/tokens.css (see design.md). No raw colours here.
const v = (name) => `var(--${name})`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: v('color-paper'),
        surface: v('color-surface'),
        'surface-2': v('color-surface-2'),
        ink: v('color-ink'),
        'ink-2': v('color-ink-2'),
        muted: v('color-muted'),
        rule: v('color-rule'),
        'rule-strong': v('color-rule-strong'),
        accent: v('color-accent'),
        'accent-strong': v('color-accent-strong'),
        'accent-tint': v('color-accent-tint'),
        'accent-ink': v('color-accent-ink'),
        focus: v('color-focus'),
        ok: v('color-ok'),
        'ok-tint': v('color-ok-tint'),
        'ok-rule': v('color-ok-rule'),
        bad: v('color-bad'),
        'bad-tint': v('color-bad-tint'),
        'bad-rule': v('color-bad-rule'),
        wait: v('color-wait'),
        'wait-tint': v('color-wait-tint'),
        'wait-rule': v('color-wait-rule'),
        badge: v('color-badge'),
        night: v('color-night'),
        'night-ink': v('color-night-ink'),
        'night-rule': v('color-night-rule'),
        scrim: v('color-scrim'),
        squiggle: v('color-squiggle'),
      },
      fontFamily: {
        body: v('font-body'),
        display: v('font-display'),
        wordmark: v('font-wordmark'),
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        md: ['18px', '26px'],
        lg: ['22px', '28px'],
        xl: ['28px', '34px'],
        '2xl': ['36px', '42px'],
        display: ['44px', '50px'],
      },
      spacing: {
        gutter: v('gutter'),
        topbar: v('topbar-h'),
      },
      borderRadius: {
        input: v('radius-input'),
        tile: v('radius-tile'),
        card: v('radius-card'),
        panel: v('radius-panel'),
        pill: v('radius-pill'),
      },
      boxShadow: {
        hover: v('shadow-hover'),
        sheet: v('shadow-sheet'),
        toast: v('shadow-toast'),
      },
      transitionTimingFunction: {
        out: v('ease-out'),
        in: v('ease-in'),
      },
      transitionDuration: {
        press: '120ms',
        short: '160ms',
        'sheet-in': '240ms',
        'sheet-out': '180ms',
        slide: '480ms',
      },
    },
  },
  plugins: [],
}
