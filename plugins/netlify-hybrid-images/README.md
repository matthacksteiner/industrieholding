# Netlify Hybrid Images Plugin

Fetch original Kirby media assets during `astro build` and publish them to the local `public/` directory so Netlify's on-demand image CDN can generate responsive variants at the edge without relying on origin fetches.

## What it does

1. Reads the cached Kirby JSON content in `public/content/`.
2. Detects media URLs that originate from `${KIRBY_URL}/media/...`.
3. Downloads each original asset into `public/media/…`.
4. (Optional) Rewrites the JSON content to reference the local `/media/...` path instead of the Kirby origin.

This hybrid approach deploys the untouched originals alongside the site bundle while still delegating responsive image generation to Netlify's CDN.

## Usage

Register the integration in `astro.config.mjs`:

```js
import netlifyHybridImages from './plugins/netlify-hybrid-images/index.js';

export default defineConfig({
	integrations: [
		netlifyHybridImages(),
		// …
	],
});
```

Ensure the `KIRBY_URL` environment variable is available so the plugin can detect valid media URLs.

## Configuration

| Option            | Type    | Default    | Description                                                                 |
| ----------------- | ------- | ---------- | --------------------------------------------------------------------------- |
| `enabled`         | boolean | `true`     | Toggles the plugin.                                                         |
| `publicDir`       | string  | `'public'` | Root directory where Astro copies static assets.                            |
| `mediaDir`        | string  | `'media'`  | Sub-directory inside `publicDir` where Kirby assets will be stored.         |
| `concurrency`     | number  | `4`        | Maximum number of simultaneous downloads.                                   |
| `rewriteContent`  | boolean | `true`     | Replace Kirby media URLs in `public/content/*.json` with the local variant. |

Disable `rewriteContent` if you only want local copies without touching the cached JSON.

## Netlify Notes

- The plugin runs during `astro build`; the downloaded assets are emitted with the rest of the static bundle and served from the Netlify CDN.
- If any download fails, the plugin keeps the Kirby URLs untouched to avoid broken image references.
