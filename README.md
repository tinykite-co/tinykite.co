# tinykite.co

TinyKite company website - Utility apps that make your life easier.

## 🚀 Tech Stack

- **Framework**: [Astro](https://astro.build) - Fast, modern static site generator
- **Styling**: [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- **Content**: [MDX](https://mdxjs.com) - Markdown with JSX support
- **Deployment**: [GitHub Pages](https://pages.github.com) - Free static hosting with custom domain

## 🎨 Features

- ✅ **Pi.ai-style green theme** (#1DB954) with dark mode (#111111)
- ✅ **Light/Dark mode** toggle with persistence
- ✅ **MDX content** for apps and blog posts
- ✅ **App filtering** by category (productivity, utility, developer, other)
- ✅ **SEO optimized** with meta tags on all pages
- ✅ **RSS feed** for blog posts
- ✅ **Sitemap** for search engines
- ✅ **Fully responsive** design
- ✅ **TypeScript** for type safety

## 📁 Project Structure

```
/
├── public/             # Static assets
│   └── favicon.svg
├── src/
│   ├── components/     # Reusable components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── ThemeToggle.astro
│   ├── content/        # MDX content collections
│   │   ├── apps/       # App descriptions
│   │   └── blog/       # Blog posts
│   ├── layouts/        # Page layouts
│   │   └── Layout.astro
│   ├── pages/          # Route pages
│   │   ├── apps/       # Apps listing and detail pages
│   │   ├── blog/       # Blog listing and post pages
│   │   ├── index.astro # Homepage
│   │   ├── about.astro
│   │   ├── changelog.astro
│   │   ├── privacy.astro
│   │   ├── terms.astro
│   │   └── rss.xml.js  # RSS feed
│   └── styles/
│       └── global.css  # Global styles
├── astro.config.mjs    # Astro configuration
├── tailwind.config.mjs # Tailwind configuration
└── tsconfig.json       # TypeScript configuration
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro`           | Run Astro CLI commands                           |

## 🚢 Deployment

This site is configured for deployment on GitHub Pages:

1. Enable GitHub Pages in repository Settings → Pages
2. Select "GitHub Actions" as the build source
3. Push to the `main` branch
4. GitHub Actions will automatically build and deploy

The site will be available at: `https://tinykite.co/`

See `DEPLOYMENT.md` for detailed instructions and custom domain setup.

## 📝 Adding Content

### Adding a New App

Create a new MDX file in `src/content/apps/`:

```mdx
---
title: "App Name"
description: "Brief description"
icon: "🚀"
category: "productivity" # or "utility", "developer", "other"
featured: true
publishDate: 2025-11-01
link: "https://example.com/app"
---

## Overview

Your app content here...
```

### Adding a Blog Post

Create a new MDX file in `src/content/blog/`:

```mdx
---
title: "Post Title"
description: "Brief description"
publishDate: 2025-11-01
author: "TinyKite Team"
tags: ["tag1", "tag2"]
---

Your blog post content here...
```

## 🎨 Theme

The site uses a Pi.ai-inspired color scheme:

- **Primary Green**: `#1DB954`
- **Dark Background**: `#111111`
- **Light Background**: `#FFFFFF`

## 📄 License

ISC

