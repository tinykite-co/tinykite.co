/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // Indigo-600
          light: '#6366F1',   // Indigo-500
          dark: '#4338CA',    // Indigo-700
        },
        secondary: {
          DEFAULT: '#3B82F6', // Blue-500
          light: '#60A5FA',   // Blue-400
          dark: '#2563EB',    // Blue-600
        },
        dark: {
          DEFAULT: '#111111',
          lighter: '#1A1A1A',
          light: '#2A2A2A',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
      },
    },
  },
  plugins: [],
}
