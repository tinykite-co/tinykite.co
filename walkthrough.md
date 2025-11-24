# Walkthrough - Dynamic Background Implementation

## Changes

### Hero Section (`src/components/Hero.astro`)
- **Removed**: Static background image (`hero_background_abstract_1763922557351.png`) which was only visible in dark mode.
- **Added**: A dynamic CSS-based background with two large gradient orbs (`bg-primary` and `bg-secondary`).
- **Added**: JavaScript logic to track mouse movement over the hero section and update the position of the orbs.
  - **Orb 1**: Follows the mouse directly with a smooth transition.
  - **Orb 2**: Moves in opposition to the mouse to create a parallax/depth effect.
- **Refined**: Used `mix-blend-screen` and `blur-3xl` for a premium, glowing effect that works well in both dark and light modes (though optimized for dark mode with opacity adjustments).

## Verification Results

### Visual Verification
- **Interaction**: The background now reacts to mouse movement. As the user moves their cursor, the gradient orbs shift position.
- **Performance**: Uses CSS transforms (`translate`) which are performant and don't trigger reflows.
- **Theme Support**: The effect is visible in both modes.
  - **Dark Mode**: Uses `mix-blend-screen` for a glowing, additive effect.
  - **Light Mode**: Uses `mix-blend-multiply` to ensure the orbs are visible against the white background, creating a subtle, premium tint.

### Deep Dive Verification
- **Responsiveness**: Verified layout on mobile (375px width). The text scales correctly (`text-5xl` to `md:text-7xl`) and the layout stacks vertically as expected.
- **Fonts**: Confirmed 'Inter' font is loaded and applied to the body (`font-family: Inter, system-ui, sans-serif`).
- **Console Health**: Zero console errors detected during navigation and interaction.
- **Assets**: Verified all app showcase mockup images exist in the assets directory.

### Legal Pages & Company Info
- **New Pages**: Added `Privacy Policy` and `Terms of Service` pages with standard legal text and company details.
- **Footer Update**: Updated the footer to display "TinyKite Ltd", "Company No. 16825578", and links to the new legal pages.
- **Verification**: Confirmed links work and pages load correctly with the proper company information.

### Code Quality
- **Robustness**: Added `id="hero"` to the section to ensure the script targets the correct element.
- **Tailwind**: Used standard Tailwind classes and fixed potential issues with opacity modifiers on CSS variables. Corrected blend modes for cross-theme compatibility.
