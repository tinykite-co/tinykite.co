import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://elloloop.github.io',
  base: '/tinykite.co',
  integrations: [
    tailwind(),
    mdx(),
    sitemap(),
  ],
});
