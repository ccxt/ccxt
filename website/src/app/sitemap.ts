import type { MetadataRoute } from 'next';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { source } from '@/lib/source';
import { blog } from '@/lib/blog';
import { basePath, siteUrl } from '@/lib/shared';
import { i18n } from '@/lib/i18n';

export const dynamic = 'force-static';

const base = `${siteUrl}${basePath}`;

// default locale keeps un-prefixed URLs (/docs/...); others get /<locale>/docs/...
function locUrl(locale: string, path: string): string {
  const prefix = locale === i18n.defaultLanguage ? '' : `/${locale}`;
  return `${base}${prefix}${path}`;
}

// Pages with real per-locale translations live on disk as <name>.<locale>.md (the
// hand-written guides + homepage). Everything else is English-only reference, so we
// emit a single canonical URL for it instead of 7 duplicate hreflang variants.
// Derive the set from disk so it can't drift from what the converter produced.
function translatedSlugs(): Set<string> {
  const dir = join(process.cwd(), 'content', 'docs');
  const langs = i18n.languages.filter((l) => l !== i18n.defaultLanguage).join('|');
  const re = new RegExp(`^(.+)\\.(${langs})\\.md$`);
  const slugs = new Set<string>();
  for (const file of readdirSync(dir)) {
    const m = file.match(re);
    if (m) slugs.add(m[1]);
  }
  return slugs;
}

// alternates.languages map for a path that exists in every locale (hreflang),
// including x-default -> the default-locale URL.
function hreflang(path: string): Record<string, string> {
  const languages: Record<string, string> = { 'x-default': locUrl(i18n.defaultLanguage, path) };
  for (const locale of i18n.languages) languages[locale] = locUrl(locale, path);
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const translated = translatedSlugs();

  // homepage — translated in every locale
  const homeLanguages = hreflang('');
  for (const locale of i18n.languages) {
    entries.push({ url: locUrl(locale, ''), changeFrequency: 'weekly', alternates: { languages: homeLanguages } });
  }

  for (const page of source.getPages(i18n.defaultLanguage)) {
    const path = page.url; // en, un-prefixed: /docs or /docs/...
    const slug = page.slugs[0] ?? 'index';
    if (page.slugs.length <= 1 && translated.has(slug)) {
      const languages = hreflang(path);
      for (const locale of i18n.languages) {
        entries.push({ url: locUrl(locale, path), changeFrequency: 'weekly', alternates: { languages } });
      }
    } else {
      entries.push({ url: `${base}${path}`, changeFrequency: 'weekly' });
    }
  }

  // blog — English-only, one canonical un-prefixed URL per post (no hreflang variants)
  entries.push({ url: `${base}/blog`, changeFrequency: 'weekly' });
  for (const post of blog.getPages()) {
    entries.push({ url: `${base}${post.url}`, lastModified: new Date(post.data.date), changeFrequency: 'monthly' });
  }

  return entries;
}
