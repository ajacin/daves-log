/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        td: {
          bg: '#ffffff',
          text: '#111111',
          muted: '#6b6b6b',
          faint: '#9a9a9a',
          border: '#e9e9e9',
          'border-strong': '#dedede',
          hover: '#f7f7f7',
          focus: '#111111',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'td-base': ['13px', { lineHeight: '1.4' }],
        'td-sm': ['12px', { lineHeight: '1.4' }],
        'td-xs': ['11px', { lineHeight: '1.4' }],
        'td-header': ['11px', { lineHeight: '1.4', letterSpacing: '0.08em' }],
      },
    },
  },
  plugins: [],
}
