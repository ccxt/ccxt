# CCXT documentation site

The [docs.ccxt.com](https://docs.ccxt.com) site, built with [Fumadocs](https://fumadocs.dev)
on Next.js 16 (App Router). It runs as a **standalone Node server** (containerized), not a
static export, and is served behind nginx under the **`/v2`** base path while it coexists
with the old Docsify site.

## How content is produced

The pages are **generated**, not hand-written here:

```
ts/src/*.ts (JSDoc) ──jsdoc2md/examples2md──▶ wiki/*.md ──build/wiki-to-fumadocs.ts──▶ docs/website/content/docs/** (gitignored)
```

- `wiki/*.md` (committed) is the shared source for both this site and the GitHub wiki.
- `build/wiki-to-fumadocs.ts` converts it to `docs/website/content/docs/**` (gitignored — regenerate, don't edit).
- `examples2md.js` generates the per-language example pages (JS/Python/TS/PHP/C#/Go/Java/Rust) under `wiki/examples/`.

The one exception is `wiki/comparisons/` — the hand-written "CCXT vs \<X>" pages served at
`/docs/comparisons`. They are committed markdown, and their metadata (title, description,
hub grouping) rides in HTML comments so the same file also renders on the Docsify site.
Files starting with `_` there are authoring notes and are never published; `_template.md`
is the contract for a new page. Verify every CCXT-side figure with
`node build/comparisons-facts.cjs <exchange>`.

## Local development

From the **repo root**:

```bash
npm run fumadocs-content   # wiki/*.md -> docs/website/content/docs
npm run fumadocs-dev       # the above + `next dev` in docs/website/
```

Or directly in `docs/website/` once content exists: `npm run dev` (http://localhost:3000).
Full production build: `npm run fumadocs-build` (converter + `npm run build`).

`npm run build` first runs `npm run og-images` (`scripts/generate-og-images.mjs`), which
renders the Open Graph cards into `public/og/` (gitignored): `og/home.png` and
`og/docs/<...slugs>/image.png` for every default-locale docs page. They are static files, not
route handlers, so they are served with a `Content-Length`. Since Next 16.4.5, Next strips
`Content-Length` from route-handler responses, and Telegram's link-preview crawler won't
fetch a chunked `og:image`. `next dev` doesn't generate them; run `npm run og-images` once to
preview cards locally.

> The site is normally served under `/v2`. To preview that path locally, set
> `NEXT_BASE_PATH=/v2` (and `NEXT_PUBLIC_SITE_URL`) before `npm run build && npm run start`.

## Key files

| Path | Purpose |
| --- | --- |
| `src/lib/source.ts` | Fumadocs content source adapter (`loader()`). |
| `src/lib/layout.shared.tsx` | Shared layout options (nav title/logo, section links). |
| `src/app/(home)` | Landing page + layout (animated hero, install commands, Ask-AI). |
| `src/app/docs` | Docs layout + catch-all page (`[[...slug]]`), examples card grid. |
| `src/app/api/search/route.ts` | Static Orama search index. |
| `src/app/api/chat/route.ts` | Ask-AI chat (OpenRouter, server-side). |
| `source.config.ts` | Fumadocs MDX config (rehype-raw, frontmatter schema). |

## Deploy

Containerized (`Dockerfile`, `output: 'standalone'`) and deployed by
`.github/workflows/docs-fumadocs.yml`: build amd64 image → push to GHCR → SSH to the box →
canary smoke-test on a temp port → promote (zero-downtime).

- **`OPENROUTER_API_KEY`** (Ask-AI) is provided only at runtime via a root-only env-file on
  the box — never baked into the image or committed.
- Required GitHub secrets and the cutover-to-root checklist are documented on the PR.
- **Framing:** `https://ccxt.com` may embed docs in an iframe. Next sets
  `Content-Security-Policy: frame-ancestors 'self' https://ccxt.com` (see `next.config.mjs`);
  the deploy job also drops nginx `X-Frame-Options: SAMEORIGIN` and keeps the same CSP on the
  box so cross-origin embeds are not blocked at the edge.
