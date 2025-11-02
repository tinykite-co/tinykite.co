# Deployment Guide

## Deploy to GitHub Pages

This TinyKite.co website is configured for deployment on GitHub Pages with automated builds via GitHub Actions.

### Automated Deployment Setup

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Under "Build and deployment", select "GitHub Actions" as the source

2. **Push to main branch**:
   ```bash
   git push origin main
   ```

3. **Automatic deployment**:
   - The GitHub Actions workflow will automatically build and deploy
   - Visit your site at: `https://elloloop.github.io/tinykite.co/`

### GitHub Actions Workflow

The `.github/workflows/deploy.yml` file is configured to:
- Trigger on pushes to `main` branch
- Build the Astro site
- Deploy to GitHub Pages
- Support manual workflow dispatch

### Custom Domain (Optional)

To use a custom domain like `tinykite.co`:

1. Add a `CNAME` file to the `public/` directory:
   ```
   tinykite.co
   ```

2. Configure DNS records:
   - Add a CNAME record pointing to `elloloop.github.io`
   - Or add A records for GitHub Pages IPs

3. Enable custom domain in Settings → Pages → Custom domain

### Site Configuration

The `astro.config.mjs` is configured for GitHub Pages:
```js
export default defineConfig({
  site: 'https://elloloop.github.io',
  base: '/tinykite.co',
  // ...
});
```

If using a custom domain, update the `site` value:
```js
site: 'https://tinykite.co',
base: '/',  // Remove base for custom domain
```

### Local Development

To test the production build locally:
```bash
npm run build
npm run preview
```

Visit http://localhost:4321/tinykite.co/ to see the production build.

### Build Settings

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 20.x

### Performance

Expected Lighthouse scores:
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

### Monitoring

After deployment:
- Check the Actions tab for build status
- View deployment history in Settings → Pages
- Monitor via GitHub Pages insights

## Troubleshooting

### Build fails in Actions
1. Check the Actions tab for error logs
2. Ensure all dependencies are in `package.json`
3. Verify the build works locally with `npm run build`

### 404 errors on deployed site
1. Ensure `base: '/tinykite.co'` is set in `astro.config.mjs`
2. Check that assets are using relative paths
3. Verify GitHub Pages is enabled in repository settings

### Links not working
- Make sure all internal links account for the base path
- Use Astro's built-in path helpers when possible

For issues, refer to:
- [Astro Docs](https://docs.astro.build/en/guides/deploy/github/)
- [GitHub Pages Docs](https://docs.github.com/en/pages)

