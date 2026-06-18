import { getPageImage, getPageMarkdownUrl, source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { getMDXComponents } from '@/components/mdx';
import { ExamplesGrid } from '@/components/examples-grid';
import { InstallCommands } from '@/components/install-commands';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { appName, gitConfig } from '@/lib/shared';
import { i18n } from '@/lib/i18n';
import { Sparkles, GraduationCap } from 'lucide-react';

// Render on demand, then cache (no build-time prebake of ~700 pages -> small image).
export const revalidate = false;

// The docs are generated from committed sources — mostly wiki/*.md, plus a few non-wiki
// files (e.g. examples/README.md → /docs/examples/citations) — not from the gitignored
// content/docs output. So "view source" must resolve to the real source (see wikiSourcePath).
const WIKI_BRANCH = 'master';

// Guides relocated to a new route — redirect the old slug so existing links/bookmarks
// don't 404. 'Awesome CCXT' moved from /docs/awesome to /docs/examples/awesome.
const MOVED_SLUGS: Record<string, string> = { awesome: 'examples/awesome' };
const GUIDE_WIKI: Record<string, string> = {
  index: 'README.md', manual: 'Manual.md', 'pro-manual': 'ccxt.pro.manual.md', pro: 'ccxt.pro.md',
  install: 'Install.md', cli: 'CLI.md', 'examples-overview': 'Examples.md', faq: 'FAQ.md',
  requirements: 'Requirements.md', 'ai-skills': 'AI-Skills.md', stats: 'Stats.md',
  certification: 'Certification.md', 'base-spec': 'baseSpec.md', 'exchange-markets': 'Exchange-Markets.md',
  'exchange-markets-by-country': 'Exchange-Markets-By-Country.md', changelog: 'CHANGELOG.md', contributing: 'CONTRIBUTING.md',
};

function wikiSourcePath(slugs: string[]): string | undefined {
  if (slugs[0] === 'exchanges' && slugs[1]) return `wiki/exchanges/${slugs[1]}.md`;
  if (slugs[0] === 'examples') {
    // citations page is synced from the repo-root examples README, not the wiki tree
    if (slugs[1] === 'citations') return 'examples/README.md';
    if (slugs[1] === 'awesome') return 'wiki/Awesome.md';
    const lang = slugs[1];
    const name = slugs[2];
    if (lang && name) return `wiki/examples/${lang}/${name}.md`;
    if (lang) return `wiki/examples/${lang}/README.md`;
  }
  const file = GUIDE_WIKI[slugs[0] ?? 'index'];
  return file ? `wiki/${file}` : undefined;
}

// Redirect a relocated guide's old slug to its new route (locale-aware), or undefined.
function movedRedirect(slug: string[] | undefined, lang: string): string | undefined {
  const dest = slug?.length === 1 ? MOVED_SLUGS[slug[0]] : undefined;
  if (!dest) return undefined;
  return `${lang === i18n.defaultLanguage ? '' : `/${lang}`}/docs/${dest}`;
}

export default async function Page(props: PageProps<'/[lang]/docs/[[...slug]]'>) {
  const params = await props.params;
  const moved = movedRedirect(params.slug, params.lang);
  if (moved) permanentRedirect(moved);
  const page = source.getPage(params.slug, params.lang);
  if (!page) notFound();

  // /docs/examples — render the language chooser as a card grid (with brand logos)
  // instead of the generated markdown bullet list.
  if (params.slug?.length === 1 && params.slug[0] === 'examples') {
    const prefix = params.lang === i18n.defaultLanguage ? '' : `/${params.lang}`;
    return (
      <DocsPage toc={[]}>
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        <h2 className="not-prose mt-2 mb-3 text-sm font-medium text-fd-muted-foreground">
          Runnable code examples by language
        </h2>
        <ExamplesGrid />
        <h2 className="not-prose mt-8 mb-3 text-sm font-medium text-fd-muted-foreground">
          Showcases &amp; research
        </h2>
        <div className="not-prose grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href={`${prefix}/docs/examples/awesome`}
            className="flex items-center gap-4 rounded-xl border bg-fd-card p-4 transition-colors hover:bg-fd-accent"
          >
            <span
              className="grid size-11 shrink-0 place-items-center rounded-lg border"
              style={{ backgroundColor: '#F59E0B1a', borderColor: '#F59E0B40' }}
            >
              <Sparkles size={24} style={{ color: '#F59E0B' }} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-fd-foreground">Showcases — Awesome CCXT</span>
              <span className="block text-sm text-fd-muted-foreground">
                Projects, bots and integrations built with CCXT.
              </span>
            </span>
          </Link>
          <Link
            href={`${prefix}/docs/examples/citations`}
            className="flex items-center gap-4 rounded-xl border bg-fd-card p-4 transition-colors hover:bg-fd-accent"
          >
            <span
              className="grid size-11 shrink-0 place-items-center rounded-lg border"
              style={{ backgroundColor: '#6366F11a', borderColor: '#6366F140' }}
            >
              <GraduationCap size={24} style={{ color: '#6366F1' }} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-fd-foreground">Citations &amp; Articles</span>
              <span className="block text-sm text-fd-muted-foreground">
                Papers, theses, tutorials and projects that cite or build on CCXT.
              </span>
            </span>
          </Link>
        </div>
      </DocsPage>
    );
  }

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const wikiPath = wikiSourcePath(page.slugs);
  const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}/${wikiPath ? `blob/${WIKI_BRANCH}/${wikiPath}` : `tree/${WIKI_BRANCH}/wiki`}`;
  const isInstall = page.slugs.length === 1 && page.slugs[0] === 'install';

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={githubUrl} />
      </div>
      {/* /docs/install — lead with the same quick-install block as the homepage */}
      {isInstall ? (
        <InstallCommands lang={params.lang} className="not-prose mx-auto mb-10 w-full max-w-2xl" />
      ) : null}
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

// No generateStaticParams: render docs pages on demand (server mode) instead of baking
// ~700 pages (each embedding the full nav tree) into the image. nginx caches responses.
export async function generateMetadata(props: PageProps<'/[lang]/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const moved = movedRedirect(params.slug, params.lang);
  if (moved) permanentRedirect(moved);
  const page = source.getPage(params.slug, params.lang);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      type: 'website',
      siteName: appName,
      images: [{ url: getPageImage(page).url, width: 1200, height: 630 }],
    },
  };
}
