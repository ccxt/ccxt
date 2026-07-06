import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import rehypeRaw from 'rehype-raw';

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

export default defineConfig({
  mdxOptions: {
    rehypePlugins: (v) => [[rehypeRaw, rehypeRawOptions], ...v],
    // CCXT docs reference many remote images (githubusercontent, shields.io badges,
    // screenshots). Don't fetch their dimensions at build time — render as plain <img>.
    remarkImageOptions: false,
  },
});
