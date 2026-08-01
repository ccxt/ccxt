import { defineCollections, defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';
import rehypeRaw from 'rehype-raw';
import { visit } from 'unist-util-visit';

// You can customize Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// Blog posts are hand-written MDX committed under content/blog (unlike content/docs,
// which is generated from wiki/). English-only — no per-locale variants.
export const blogPosts = defineCollections({
  type: 'doc',
  dir: 'content/blog',
  schema: pageSchema.extend({
    author: z.string().default('CCXT Team'),
    // YAML parses bare dates (date: 2026-07-07) as Date; quoted strings coerce
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});

// fumadocs compiles `.md` with MDX format:'md' (so <...>/{...} are literal) but
// injects `mdxjsEsm` export nodes (frontmatter/TOC). rehype-raw must pass those
// MDX nodes through untouched while it parses the real raw HTML in the generated
// reference pages (<a name>, <code>, ...) so it renders instead of being dropped.
const rehypeRawOptions = {
  passThrough: [
    'mdxjsEsm',
    'mdxFlowExpression',
    'mdxTextExpression',
    'mdxJsxFlowElement',
    'mdxJsxTextElement',
  ],
};

// Turn a ```prediction-diagram fenced code block into <PredictionDataModel/> (mapped to the
// client component in mdx.tsx) BEFORE shiki highlights it, so the prediction overview renders
// the bespoke animated diagram instead of an empty code listing. wiki-to-fumadocs swaps the
// wiki's ```mermaid fence (which GitHub renders natively) for ```prediction-diagram on the
// website. Runs after rehype-raw and before the default code-highlight plugins.
function collectText(node: any): string {
  if (node.type === 'text') return node.value;
  if (!node.children) return '';
  let out = '';
  for (const child of node.children) out += collectText(child);
  return out;
}
// fence language -> { component, withText }. withText passes the fence body to the
// component as a `data` string prop (used by ExchangesTable for its JSON dataset).
const FENCE_COMPONENTS: Record<string, { name: string; withText?: boolean }> = {
  'language-prediction-diagram': { name: 'PredictionDataModel' },
  'language-exchanges-table': { name: 'ExchangesTable', withText: true },
};
function rehypeFenceComponents() {
  return (tree: any) => {
    visit(tree, 'element', (node: any) => {
      if (node.tagName !== 'pre' || !node.children || node.children.length === 0) return;
      const code = node.children[0];
      const classes = (code && code.properties && code.properties.className) || [];
      if (!(code && code.tagName === 'code' && Array.isArray(classes))) return;
      const key = classes.find((c: string) => FENCE_COMPONENTS[c]);
      if (!key) return;
      const spec = FENCE_COMPONENTS[key];
      const attributes = spec.withText
        ? [{ type: 'mdxJsxAttribute', name: 'data', value: collectText(code).replace(/\n$/, '') }]
        : [];
      node.type = 'mdxJsxFlowElement';
      node.name = spec.name;
      node.attributes = attributes;
      node.children = [];
      delete node.tagName;
      delete node.properties;
    });
  };
}

export default defineConfig({
  mdxOptions: {
    rehypePlugins: (v) => [[rehypeRaw, rehypeRawOptions], rehypeFenceComponents, ...v],
    // CCXT docs reference many remote images (githubusercontent, shields.io badges,
    // screenshots). Don't fetch their dimensions at build time — render as plain <img>.
    remarkImageOptions: false,
  },
});
