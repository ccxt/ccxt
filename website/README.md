# CCXT documentation site

The [docs.ccxt.com](https://docs.ccxt.com) site, built with [Fumadocs](https://fumadocs.dev)
on Next.js 16 (App Router). It runs as a **standalone Node server** (containerized), not a
static export, and is served behind nginx under the **`/v2`** base path while it coexists
with the old Docsify site.

## How content is produced

The pages are **generated**, not hand-written here:

```
ts/src/*.ts (JSDoc) ──jsdoc2md/examples2md──▶ wiki/*.md ──build/wiki-to-fumadocs.ts──▶ website/content/docs/** (gitignored)
```

- `wiki/*.md` (committed) is the shared source for both this site and the GitHub wiki.
- `build/wiki-to-fumadocs.ts` converts it to `website/content/docs/**` (gitignored — regenerate, don't edit).
- `examples2md.js` generates the per-language example pages (JS/Python/TS/PHP/C#/Go/Java) under `wiki/examples/`.

## Local development

From the **repo root**:

```bash
npm run fumadocs-content   # wiki/*.md -> website/content/docs
npm run fumadocs-dev       # the above + `next dev` in website/
```

Or directly in `website/` once content exists: `npm run dev` (http://localhost:3000).
Full production build: `npm run fumadocs-build` (converter + `next build`).

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
`.github/workflows/docs-fumadocs.yml`: build arm64 image → push to GHCR → SSH to the box →
canary smoke-test on a temp port → promote (zero-downtime).

- **`OPENROUTER_API_KEY`** (Ask-AI) is provided only at runtime via a root-only env-file on
  the box — never baked into the image or committed.
- Required GitHub secrets and the cutover-to-root checklist are documented on the PR.
