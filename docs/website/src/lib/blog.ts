import { blogPosts } from 'collections/server';
import { toFumadocsSource } from 'fumadocs-mdx/runtime/server';
import { loader } from 'fumadocs-core/source';
import { i18n } from './i18n';
import { basePath, siteUrl } from './shared';

// Posts are written in English as content/blog/<slug>.mdx; translations sit next to them
// as <slug>.<locale>.mdx (the same dot convention the docs guides use). A locale that has
// no translation for a post falls back to the English one, so every post resolves in
// every locale. Non-default locales get /<locale>/blog/<slug> URLs (hideLocale keeps the
// English ones un-prefixed).
export const blog = loader({
  i18n,
  baseUrl: '/blog',
  source: toFumadocsSource(blogPosts, []),
});

export type BlogPost = ReturnType<typeof blog.getPages>[number];

// default locale keeps un-prefixed URLs (/blog); others get /<locale>/blog
export function localePrefix(lang: string): string {
  return lang === i18n.defaultLanguage ? '' : `/${lang}`;
}

export const POSTS_PER_PAGE = 6;

export function getSortedPosts(lang: string = i18n.defaultLanguage): BlogPost[] {
  return [...blog.getPages(lang)].sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );
}

// Every locale has the same post count (missing translations fall back to English).
export function getTotalPages(): number {
  return Math.max(1, Math.ceil(blog.getPages(i18n.defaultLanguage).length / POSTS_PER_PAGE));
}

// 1-indexed page of the date-sorted post list; empty array past the end.
export function getPostsPage(page: number, lang: string = i18n.defaultLanguage): BlogPost[] {
  return getSortedPosts(lang).slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
}

// True when the post is really written in its locale (a <slug>.<locale>.mdx file), false
// when the loader served the English fallback under a non-default locale.
export function isTranslated(post: BlogPost): boolean {
  if (post.locale === undefined || post.locale === i18n.defaultLanguage) return true;
  return post.absolutePath?.endsWith(`.${post.locale}.mdx`) ?? false;
}

// Absolute URL prefix for blog canonical/OG/RSS links — includes the basePath so
// a subpath deploy (/v2) emits URLs consistent with the sitemap.
export const blogAbsoluteBase = `${siteUrl}${basePath}`;

// Locale-less absolute URL of the English post — the RSS feed and syndication
// (dev.to/Hashnode/Medium canonical_url) always point at it.
export function postCanonicalUrl(post: BlogPost): string {
  return `${blogAbsoluteBase}/blog/${post.slugs.join('/')}`;
}

// Absolute URL of the post in a given locale.
export function postLocaleUrl(post: BlogPost, lang: string): string {
  return `${blogAbsoluteBase}${localePrefix(lang)}/blog/${post.slugs.join('/')}`;
}

// hreflang map for a post: only the locales that have a real translation (plus
// x-default -> English). Locales served the English fallback are left out so search
// engines don't index the same English text under seven URLs.
export function postAlternates(post: BlogPost): Record<string, string> {
  const languages: Record<string, string> = { 'x-default': postCanonicalUrl(post) };
  for (const lang of i18n.languages) {
    const variant = blog.getPage(post.slugs, lang);
    if (variant && isTranslated(variant)) languages[lang] = postLocaleUrl(post, lang);
  }
  return languages;
}

// The site's locale codes aren't full BCP 47 tags; map them to the regional variants
// the translations are written in for Intl date formatting.
const INTL_LOCALE: Record<string, string> = {
  en: 'en-US',
  es: 'es',
  pt: 'pt-BR',
  ko: 'ko-KR',
  zh: 'zh-CN',
  fr: 'fr',
  de: 'de',
};

export function formatPostDate(date: Date | string, lang: string = i18n.defaultLanguage): string {
  return new Date(date).toLocaleDateString(INTL_LOCALE[lang] ?? 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

// Chrome strings of the blog pages (index header, pager, post header) per locale.
// Falls back to English for an unknown locale.
export interface BlogStrings {
  blog: string;
  description: string;
  allPosts: string;
  rss: string;
  by: string;
  newer: string;
  older: string;
  pagination: string;
  pageOf: (page: number, total: number) => string;
  pageTitle: (page: number) => string;
}

const BLOG_STRINGS: Record<string, BlogStrings> = {
  en: {
    blog: 'Blog',
    description:
      'News, release deep-dives, and multi-language guides from the CCXT team — the open-source library connecting 100+ cryptocurrency exchanges.',
    allPosts: 'All posts',
    rss: 'Subscribe via RSS',
    by: 'By',
    newer: 'Newer',
    older: 'Older',
    pagination: 'Blog pagination',
    pageOf: (page, total) => `Page ${page} of ${total}`,
    pageTitle: (page) => `Blog — page ${page}`,
  },
  es: {
    blog: 'Blog',
    description:
      'Noticias, análisis de cada versión y guías en varios lenguajes del equipo de CCXT: la biblioteca de código abierto que conecta más de 100 exchanges de criptomonedas.',
    allPosts: 'Todas las publicaciones',
    rss: 'Suscribirse por RSS',
    by: 'Por',
    newer: 'Más recientes',
    older: 'Más antiguas',
    pagination: 'Paginación del blog',
    pageOf: (page, total) => `Página ${page} de ${total}`,
    pageTitle: (page) => `Blog — página ${page}`,
  },
  pt: {
    blog: 'Blog',
    description:
      'Notícias, análises detalhadas de cada versão e guias em várias linguagens da equipe do CCXT — a biblioteca open source que conecta mais de 100 exchanges de criptomoedas.',
    allPosts: 'Todos os posts',
    rss: 'Assinar via RSS',
    by: 'Por',
    newer: 'Mais recentes',
    older: 'Mais antigos',
    pagination: 'Paginação do blog',
    pageOf: (page, total) => `Página ${page} de ${total}`,
    pageTitle: (page) => `Blog — página ${page}`,
  },
  ko: {
    blog: '블로그',
    description:
      '100개 이상의 암호화폐 거래소를 연결하는 오픈소스 라이브러리, CCXT 팀의 소식과 릴리스 심층 분석, 다국어 가이드.',
    allPosts: '전체 글',
    rss: 'RSS로 구독',
    by: '작성자',
    newer: '최신 글',
    older: '이전 글',
    pagination: '블로그 페이지 이동',
    pageOf: (page, total) => `${total}페이지 중 ${page}페이지`,
    pageTitle: (page) => `블로그 — ${page}페이지`,
  },
  zh: {
    blog: '博客',
    description:
      '来自 CCXT 团队的新闻、版本深度解析和多语言指南——CCXT 是连接 100 多家加密货币交易所的开源库。',
    allPosts: '全部文章',
    rss: '通过 RSS 订阅',
    by: '作者',
    newer: '较新',
    older: '较早',
    pagination: '博客分页',
    pageOf: (page, total) => `第 ${page} 页，共 ${total} 页`,
    pageTitle: (page) => `博客 — 第 ${page} 页`,
  },
  fr: {
    blog: 'Blog',
    description:
      "Actualités, analyses détaillées des versions et guides multi-langages de l'équipe CCXT — la bibliothèque open source qui connecte plus de 100 plateformes d'échange de cryptomonnaies.",
    allPosts: 'Tous les articles',
    rss: "S'abonner via RSS",
    by: 'Par',
    newer: 'Plus récents',
    older: 'Plus anciens',
    pagination: 'Pagination du blog',
    pageOf: (page, total) => `Page ${page} sur ${total}`,
    pageTitle: (page) => `Blog — page ${page}`,
  },
  de: {
    blog: 'Blog',
    description:
      'Neuigkeiten, Release-Deep-Dives und mehrsprachige Anleitungen vom CCXT-Team – der Open-Source-Bibliothek, die über 100 Kryptobörsen verbindet.',
    allPosts: 'Alle Beiträge',
    rss: 'Per RSS abonnieren',
    by: 'Von',
    newer: 'Neuere',
    older: 'Ältere',
    pagination: 'Blog-Seitennavigation',
    pageOf: (page, total) => `Seite ${page} von ${total}`,
    pageTitle: (page) => `Blog – Seite ${page}`,
  },
};

export function blogStrings(lang: string = i18n.defaultLanguage): BlogStrings {
  return BLOG_STRINGS[lang] ?? BLOG_STRINGS.en;
}

// English description — used by the RSS feed and any locale-less metadata.
export const blogDescription = BLOG_STRINGS.en.description;
