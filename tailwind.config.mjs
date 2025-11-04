import { theme } from './src/config/theme.ts';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: theme.colors,
      fontFamily: theme.fontFamily,
      backgroundImage: {
        'gradient-primary': `linear-gradient(135deg, ${theme.colors.primary.DEFAULT} 0%, ${theme.colors.secondary.DEFAULT} 100%)`,
      },
    },
  },
  plugins: [],
}
