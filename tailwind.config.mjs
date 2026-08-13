/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'var(--color-bg)',
        text: 'var(--color-text)',
        panel: 'var(--color-panel-bg)',
        border: 'var(--color-border)',
        'background-dark': '#000000', /* Keep for specific dark-only uses if needed */
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        brand: {
          navy: '#0B1020',
          'navy-light': '#141B33',
          cream: '#F7F4EE',
          gold: '#FFB23C',
          'gold-soft': '#FFD28A',
          teal: '#2AA48F',
          slate: '#667085',
          mist: '#E7E8EB',
        },
      },
    },
  },
  plugins: [],
}
