import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://tinykite.co',
  integrations: [
    tailwind(),
    mdx(),
    sitemap(),
  ],
  redirects: {
    '/tools': '/coming-soon',
    '/router': '/coming-soon',
    // The single funding page became one page per language (PR #34).
    '/gloss/support-us': '/gloss/back/',
  },
});
