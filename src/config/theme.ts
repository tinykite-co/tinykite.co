/**
 * Centralized Theme Configuration
 * 
 * This file defines all core design tokens for the TinyKite application.
 * All colors, typography, and other theme values should be defined here
 * to maintain consistency across the application.
 */

export const theme = {
  colors: {
    // Primary Color - Main brand color (Indigo)
    primary: {
      DEFAULT: '#4F46E5', // Indigo-600
      light: '#6366F1',   // Indigo-500
      dark: '#4338CA',    // Indigo-700
    },
    
    // Secondary Color - Accent color (Blue)
    secondary: {
      DEFAULT: '#3B82F6', // Blue-500
      light: '#60A5FA',   // Blue-400
      dark: '#2563EB',    // Blue-600
    },
    
    // Tertiary Color - Additional accent color (Purple)
    tertiary: {
      DEFAULT: '#8B5CF6', // Purple-500
      light: '#A78BFA',   // Purple-400
      dark: '#7C3AED',    // Purple-600
    },
    
    // Dark mode colors
    dark: {
      DEFAULT: '#111111',
      lighter: '#1A1A1A',
      light: '#2A2A2A',
    },
  },
  
  // Font Family Configuration
  fontFamily: {
    // Sans-serif font stack (default)
    sans: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      '"Noto Sans"',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
      '"Noto Color Emoji"',
    ],
    
    // Serif font stack
    serif: [
      'Georgia',
      'Cambria',
      '"Times New Roman"',
      'Times',
      'serif',
    ],
    
    // Monospace font stack
    mono: [
      'ui-monospace',
      'SFMono-Regular',
      'Menlo',
      'Monaco',
      'Consolas',
      '"Liberation Mono"',
      '"Courier New"',
      'monospace',
    ],
  },
} as const;

// Export individual theme tokens for convenience
export const colors = theme.colors;
export const fontFamily = theme.fontFamily;
