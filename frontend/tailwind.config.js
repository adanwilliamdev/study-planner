/** @type {import('tailwindcss').Config} */
// As cores vêm de variáveis CSS (src/index.css), o que permite tema claro/escuro
// e continua aceitando modificadores de opacidade, como bg-brand-500/20.
const cor = (nome) => `rgb(var(--${nome}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: cor('paper'),
        surface: cor('surface'),
        sunken: cor('sunken'),
        deep: cor('deep'),
        sun: cor('sun'),
        link: cor('link'),
        line: cor('line'),
        ink: { DEFAULT: cor('ink'), soft: cor('ink-soft'), mute: cor('ink-mute') },
        brand: {
          50: cor('brand-50'), 100: cor('brand-100'), 200: cor('brand-200'),
          500: cor('brand-500'), 600: cor('brand-600'), 700: cor('brand-700'),
          900: cor('brand-900'), hover: cor('brand-hover'),
        },
        ok: { bg: cor('ok-bg'), fg: cor('ok-fg'), line: cor('ok-line'), icon: cor('ok-icon') },
        bad: { bg: cor('bad-bg'), fg: cor('bad-fg'), line: cor('bad-line'), icon: cor('bad-icon') },
        warn: { bg: cor('warn-bg'), fg: cor('warn-fg'), line: cor('warn-line'), icon: cor('warn-icon') },
      },
      boxShadow: {
        panel: '0 1px 2px rgb(var(--shadow) / .05), 0 10px 28px -14px rgb(var(--shadow) / .16)',
        lift: '0 2px 4px rgb(var(--shadow) / .06), 0 18px 36px -16px rgb(var(--shadow) / .26)',
        pop: '0 28px 70px -24px rgb(var(--shadow) / .55)',
      },
      transitionTimingFunction: {
        fluid: 'cubic-bezier(.22, 1, .36, 1)',
        spring: 'cubic-bezier(.34, 1.56, .64, 1)',
      },
      // Os @keyframes ficam em src/index.css
      animation: {
        'page-in': 'page-in .45s cubic-bezier(.22, 1, .36, 1) both',
        'toast-in': 'toast-in .35s cubic-bezier(.22, 1, .36, 1) both',
        'fade-in': 'fade-in .2s ease-out both',
        'fade-out': 'fade-out .16s ease-in both',
        'sheet-in': 'sheet-in .38s cubic-bezier(.22, 1, .36, 1) both',
        'sheet-out': 'sheet-out .16s ease-in both',
        'block-in': 'block-in .6s cubic-bezier(.22, 1, .36, 1) both',
      },
    },
  },
  plugins: [],
}
