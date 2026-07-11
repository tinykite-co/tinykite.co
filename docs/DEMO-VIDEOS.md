# Demo videos — how we ship them (binding)

**Future agents: do not invent a new path.** Every product page on this site
follows the Nesta pattern below. Videos are **never** committed to git.

## The rule

| What | Where |
|------|--------|
| Product docs page | This repo (`src/pages/<app>/`, `src/data/<app>/features.json`) |
| Demo videos | **GitHub Release assets** on `tinykite-co/tinykite.co` |
| Local recordings | App monorepo `mobile-apps/<app>/demos/videos/` (**gitignored**) |

**Never** put `.mp4` files under `public/`. They bloat the repo, defeat
regeneration, and break the Nesta workflow.

## Pattern (copy Nesta / Gloss)

1. **Record + produce** in the monorepo (hermetic demos + logo intro/outro + synthesized music).
2. **Upload** finished cuts as assets on a versioned release tag:
   - Nesta: `nesta-videos-v1` (bump to `v2` when the whole set is re-cut)
   - Gloss: `gloss-videos-v1`
3. **Point the site** at that release with `videoBase` in `src/data/<app>/features.json`:

```json
"videoBase": "https://github.com/tinykite-co/tinykite.co/releases/download/gloss-videos-v1/"
```

4. Each feature lists only a **base filename** (or dual-platform base):

```json
"video": "demo_lookup-word.mp4"
```

The page builds the real URL:
- Single-platform (Nesta v1): `{videoBase}{video}`
- Dual-platform (Gloss / Nesta switcher):  
  `{videoBase}{stem}_android.mp4` and `{videoBase}{stem}_ios.mp4`  
  (or Nesta’s prefix form `android_{video}` if that release uses prefixes)

## Publish a new video set

```bash
# From monorepo after record + produce:
VIDEOS=mobile-apps/<app>/demos/videos
cd /path/to/tinykite.co

gh release create <app>-videos-vN \
  "$VIDEOS"/demo_*.mp4 \
  --title "<App> demo videos vN" \
  --notes "Feature demos for tinykite.co/<app>/. Release assets only — never in git."

# Then set videoBase in src/data/<app>/features.json to:
# https://github.com/tinykite-co/tinykite.co/releases/download/<app>-videos-vN/
```

Replacing assets on an existing tag is possible with `gh release upload … --clobber`,
but prefer a new `vN` when the set changes meaningfully so old links stay stable.

## Why releases (not public/ or R2 in the default path)

- Nesta messenger catalog: release notes state explicitly  
  **“Videos are release assets by design — they never enter git history.”**
- Site stays small; videos regenerate from monorepo drivers anytime.
- (Older calendar-era Nesta once used R2 URLs; the **current** messenger
  catalog uses GitHub Releases. Prefer releases unless product decides CDN.)

## Checklist for any new app page

- [ ] `demos/videos/` gitignored in the app
- [ ] Record/produce scripts in `integration_test/demos/`
- [ ] Release tag `{app}-videos-vN` with mp4 assets
- [ ] `videoBase` → that release download URL
- [ ] Features reference base names only
- [ ] No mp4 under `public/`
