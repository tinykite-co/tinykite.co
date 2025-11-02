/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1DB954',
          light: '#1ED760',
          dark: '#1AA34A',
        },
        dark: {
          DEFAULT: '#111111',
          lighter: '#1A1A1A',
          light: '#2A2A2A',
        },
      },
    },
  },
  plugins: [],
}
