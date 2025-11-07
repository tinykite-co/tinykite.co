import { theme } from './src/config/theme.ts';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ...theme.colors,
        // ensure semantic access
        background: {
          DEFAULT: theme.colors.background?.DEFAULT ?? '#ffffff',
          dark: theme.colors.background?.dark ?? '#111111',
        },
        foreground: {
          DEFAULT: theme.colors.foreground?.DEFAULT ?? '#111827',
          dark: theme.colors.foreground?.dark ?? '#ffffff',
        },
        primary: {
          DEFAULT: theme.colors.primary?.DEFAULT ?? '#4F46E5',
          light: theme.colors.primary?.light ?? '#6366F1',
          dark: theme.colors.primary?.dark ?? '#4338CA',
        },
        // ...secondary/tertiary as before
      },
      fontFamily: {
        sans: theme.fontFamily.sans,
        serif: theme.fontFamily.serif,
        mono: theme.fontFamily.mono,
      },
      backgroundImage: {
        'gradient-primary': `linear-gradient(135deg, ${theme.colors.primary.DEFAULT} 0%, ${theme.colors.secondary.DEFAULT} 100%)`,
      },
    },
  },
  plugins: [],
};
