# Deployment Guide

## Deploy to Vercel

This TinyKite.co website is optimized for deployment on Vercel.

### Quick Deploy

1. **Push to GitHub**: All code is already committed
2. **Import to Vercel**: 
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select this repository
3. **Configure** (auto-detected):
   - Framework: Astro
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Deploy**: Click deploy!

### Environment Variables

No environment variables are required for basic deployment.

### Custom Domain

After deployment, you can add your custom domain:
1. Go to Project Settings → Domains
2. Add `tinykite.co`
3. Follow DNS configuration instructions

### Build Settings

The `vercel.json` file is already configured with optimal settings:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### Automatic Deployments

- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

### Performance

Expected Lighthouse scores:
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

### Monitoring

After deployment:
- Check Analytics in Vercel dashboard
- Monitor build times and deployment status
- Set up custom alerts if needed

## Local Development

To test the production build locally:
```bash
npm run build
npm run preview
```

Visit http://localhost:4321 to see the production build.

## Troubleshooting

If the build fails:
1. Check that all dependencies are installed: `npm install`
2. Verify TypeScript types: `npm run build`
3. Review build logs in Vercel dashboard

For issues, refer to:
- [Astro Docs](https://docs.astro.build)
- [Vercel Docs](https://vercel.com/docs)
