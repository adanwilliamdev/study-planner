/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: '#F5F6FA',
        ink: { DEFAULT: '#1C2340', soft: '#4A5273', mute: '#7B829F' },
        line: '#E2E5EF',
        brand: {
          50: '#EEF1FF', 100: '#DDE3FF', 200: '#BCC8FF', 500: '#3B55E6',
          600: '#2C43C9', 700: '#2336A3', 900: '#151F5E',
        },
      },
      boxShadow: {
        panel: '0 1px 2px rgba(28,35,64,.05), 0 4px 16px -8px rgba(28,35,64,.12)',
        pop: '0 12px 40px -12px rgba(28,35,64,.35)',
      },
      keyframes: {
        'toast-in': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: { 'toast-in': 'toast-in .2s ease-out' },
    },
  },
  plugins: [],
}
