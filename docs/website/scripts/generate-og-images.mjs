// Pre-renders the Open Graph / social-card PNGs into public/og/ at build time
// (`npm run build` runs this before `next build`; `npm run og-images` runs it alone).
//
// Why static files and not route handlers: since Next 16.4.5 (the GHSA-pc58-hwjq-p385 fix)
// every Node route-handler response, prerendered ones included, has its Content-Length,
// Content-Encoding and Transfer-Encoding headers stripped, so an ImageResponse always goes
// out chunked, even when the handler buffers the PNG and sets Content-Length itself.
// Telegram's link-preview crawler won't fetch a chunked og:image (Discord/Twitter are
// lenient). Files under public/ are served by Next's static file server, which does send
// Content-Length (and ETag / Last-Modified).
//
// Output (served under NEXT_BASE_PATH like any other public/ file):
//   public/og/home.png                     home page + blog index/pagination + blog posts without their own image
//   public/og/docs/<...slugs>/image.png    one per default-locale docs page; the URL getPageImage() emits
//
// Plain ESM on purpose: the Docker builder runs Node 20, which can't load the TS sources.
// Pages are enumerated with fumadocs-core's own loader() and frontmatter parser, so the
// slugs match what src/lib/source.ts resolves at runtime.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createElement } from 'react';
import { ImageResponse } from 'next/og.js';
import { generate } from 'fumadocs-ui/og';
import { loader } from 'fumadocs-core/source';
import { defineI18n } from 'fumadocs-core/i18n';
import { frontmatter } from 'fumadocs-core/content/md/frontmatter';

const root = process.cwd();
const contentDir = join(root, 'content', 'docs');
const outDir = join(root, 'public', 'og');

const appName = 'CCXT'; // src/lib/shared.ts appName
const size = { width: 1200, height: 630 };

// Card palette: monochrome / on-brand (CCXT black & white) instead of fumadocs' default
// purple. primaryColor tints the accent lines (bottom bar + dashed divider); primaryTextColor
// tints the site name. The card background stays near-black (#0c0c0c).
const primaryColor = 'rgba(255,255,255,0.18)';
const primaryTextColor = '#fafafa';

// The CCXT mark, inlined as a data URL so Satori renders it without a network fetch. Falls
// back to fumadocs' default icon if the asset is missing, so generation never fails on it.
function readIcon() {
  try {
    const png = readFileSync(join(root, 'public', 'ccxt-mark-white.png'));
    return createElement('img', { src: `data:image/png;base64,${png.toString('base64')}`, width: 84, height: 84, alt: '' });
  } catch {
    return undefined;
  }
}

// The locale list lives in src/lib/i18n.ts. Read it from there rather than repeating it, so
// translated files (name.<locale>.md) are told apart from default-locale pages exactly as
// the site does. Fails loudly if that file stops matching this shape.
function readI18n() {
  const src = readFileSync(join(root, 'src', 'lib', 'i18n.ts'), 'utf8');
  const defaultLanguage = src.match(/defaultLanguage:\s*'([^']+)'/)?.[1];
  const languages = [...(src.match(/languages:\s*\[([^\]]*)\]/)?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
  if (!defaultLanguage || !languages.includes(defaultLanguage)) {
    throw new Error('generate-og-images: could not read defaultLanguage/languages from src/lib/i18n.ts');
  }
  return defineI18n({ defaultLanguage, languages, hideLocale: 'default-locale' });
}

// Same files fumadocs-mdx collects for the docs collection (`**/*.{md,mdx}` under
// content/docs); only the frontmatter is needed here.
function docsSource(i18n) {
  if (!existsSync(contentDir)) {
    throw new Error(`generate-og-images: ${contentDir} is missing; run \`npm run fumadocs-content\` from the repo root first`);
  }
  const files = [];
  for (const path of readdirSync(contentDir, { recursive: true })) {
    if (!/\.mdx?$/.test(path)) continue;
    const { data } = frontmatter(readFileSync(join(contentDir, path), 'utf8'));
    files.push({ type: 'page', path: path.split('\\').join('/'), data });
  }
  return loader({ baseUrl: '/docs', i18n, source: { files } });
}

const icon = readIcon();

async function render(file, title, description) {
  const card = createElement(generate, { title, description, site: appName, icon, primaryColor, primaryTextColor });
  const png = Buffer.from(await new ImageResponse(card, size).arrayBuffer());
  const target = join(outDir, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, png);
  return png.byteLength;
}

const started = Date.now();
const i18n = readI18n();
// Every locale's page points at the same /og/docs/<slugs>/image.png (getPageImage), so render
// one card per slug from the default-locale page, as the old image route did.
const pages = docsSource(i18n).getPages(i18n.defaultLanguage);

// start clean so pages that were removed or renamed don't leave stale cards behind
rmSync(outDir, { recursive: true, force: true });

let bytes = await render(
  'home.png',
  'Connect to any exchange',
  'One unified crypto trading API across 100+ exchanges — JavaScript, Python, PHP, C#, Go, Java and Rust.',
);
for (const page of pages) {
  bytes += await render(join('docs', ...page.slugs, 'image.png'), page.data.title, page.data.description);
}

const mb = (bytes / 1024 / 1024).toFixed(1);
const secs = ((Date.now() - started) / 1000).toFixed(1);
console.log(`generate-og-images: wrote ${pages.length + 1} cards (${mb} MB) to public/og in ${secs}s`);
