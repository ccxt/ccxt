import { getPageImage, getPageMarkdownUrl, source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getMDXComponents } from '@/components/mdx';
import { ExamplesGrid } from '@/components/examples-grid';
import { InstallCommands } from '@/components/install-commands';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { gitConfig } from '@/lib/shared';
import { i18n } from '@/lib/i18n';

// Render on demand, then cache (no build-time prebake of ~700 pages -> small image).
export const revalidate = false;

// The docs are generated from wiki/*.md (committed on master), not from the gitignored
// content/docs output — so "view source" must point at the real wiki markdown.
const WIKI_BRANCH = 'master';
const GUIDE_WIKI: Record<string, string> = {
  index: 'README.md', manual: 'Manual.md', 'pro-manual': 'ccxt.pro.manual.md', pro: 'ccxt.pro.md',
  install: 'Install.md', cli: 'CLI.md', 'examples-overview': 'Examples.md', faq: 'FAQ.md',
  requirements: 'Requirements.md', awesome: 'Awesome.md', 'ai-skills': 'AI-Skills.md', stats: 'Stats.md',
  certification: 'Certification.md', 'base-spec': 'baseSpec.md', 'exchange-markets': 'Exchange-Markets.md',
  'exchange-markets-by-country': 'Exchange-Markets-By-Country.md', changelog: 'CHANGELOG.md', contributing: 'CONTRIBUTING.md',
};

function wikiSourcePath(slugs: string[]): string | undefined {
  if (slugs[0] === 'exchanges' && slugs[1]) return `wiki/exchanges/${slugs[1]}.md`;
  if (slugs[0] === 'examples') {
    // citations page is synced from the repo-root examples README, not the wiki tree
    if (slugs[1] === 'citations') return 'examples/README.md';
    const lang = slugs[1];
    const name = slugs[2];
    if (lang && name) return `wiki/examples/${lang}/${name}.md`;
    if (lang) return `wiki/examples/${lang}/README.md`;
  }
  const file = GUIDE_WIKI[slugs[0] ?? 'index'];
  return file ? `wiki/${file}` : undefined;
}

export default async function Page(props: PageProps<'/[lang]/docs/[[...slug]]'>) {
  const params = await props.params;
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
        <ExamplesGrid />
        <p className="mt-8 text-sm text-fd-muted-foreground">
          See also{' '}
          <Link
            href={`${prefix}/docs/examples/citations`}
            className="font-medium text-fd-foreground underline underline-offset-2"
          >
            Citations &amp; Articles
          </Link>{' '}
          — papers, theses, tutorials and projects that cite or build on CCXT.
        </p>
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
  const page = source.getPage(params.slug, params.lang);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
