import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
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
  build: {
    inlineStylesheets: 'always',
  },
  redirects: {
    '/tools': '/coming-soon',
    '/router': '/coming-soon',
    // The single funding page became one page per language (PR #34).
    '/gloss/support-us': '/gloss/back/',
  },
  vite: {
    resolve: {
      alias: [
        {
          find: /^@refraction-ui\/astro\/(.+)$/,
          replacement: fileURLToPath(new URL('./node_modules/@refraction-ui/astro/$1', import.meta.url)),
        },
        {
          find: /^@refraction-ui\/(?!astro\b)(.+)$/,
          replacement: fileURLToPath(new URL('./node_modules/@refraction-ui/astro/dist/$1', import.meta.url)),
        },
      ],
    },
  },
});
