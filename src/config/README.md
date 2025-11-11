# Theme Configuration

This directory contains the centralized theme configuration for the TinyKite application.

## `theme.ts`

The `theme.ts` file is the single source of truth for all design tokens used throughout the application.

### Usage

Import the theme configuration in your files:

```typescript
import { theme } from './config/theme';
// or import specific tokens
import { colors, fontFamily } from './config/theme';
```

### Available Tokens

#### Colors

- **Primary** (Indigo): `theme.colors.primary`
  - DEFAULT: `#4F46E5`
  - light: `#6366F1`
  - dark: `#4338CA`

- **Secondary** (Blue): `theme.colors.secondary`
  - DEFAULT: `#3B82F6`
  - light: `#60A5FA`
  - dark: `#2563EB`

- **Tertiary** (Purple): `theme.colors.tertiary`
  - DEFAULT: `#8B5CF6`
  - light: `#A78BFA`
  - dark: `#7C3AED`

- **Dark Mode**: `theme.colors.dark`
  - DEFAULT: `#111111`
  - lighter: `#1A1A1A`
  - light: `#2A2A2A`

#### Font Families

- **Sans** (default): `theme.fontFamily.sans`
- **Serif**: `theme.fontFamily.serif`
- **Mono**: `theme.fontFamily.mono`

### Integration

The theme is automatically integrated with:

1. **Tailwind CSS** (`tailwind.config.mjs`) - All theme tokens are available as Tailwind utility classes
2. **Global CSS** (`src/styles/global.css`) - CSS custom properties for runtime access

### Updating Theme Values

To update theme values:

1. Edit `src/config/theme.ts`
2. The changes will automatically propagate to:
   - Tailwind utility classes
   - CSS custom properties
   - All components using the theme

No other files need to be modified when updating theme values.
