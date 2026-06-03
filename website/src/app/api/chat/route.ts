import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai';
import { z } from 'zod';
import { source } from '@/lib/source';
import { Document, type DocumentData } from 'flexsearch';
import { ChatUIMessage, SearchTool } from '../../../components/ai/search';

interface CustomDocument extends DocumentData {
  url: string;
  title: string;
  description: string;
  content: string;
}
const searchServer = createSearchServer();

async function createSearchServer() {
  const search = new Document<CustomDocument>({
    document: {
      id: 'url',
      index: ['title', 'description', 'content'],
      store: true,
    },
  });

  const docs = await chunkedAll(
    source.getPages().map(async (page) => {
      if (!('getText' in page.data)) return null;

      return {
        title: page.data.title,
        description: page.data.description,
        url: page.url,
        content: await page.data.getText('processed'),
      } as CustomDocument;
    }),
  );

  for (const doc of docs) {
    if (doc) search.add(doc);
  }

  return search;
}

async function chunkedAll<O>(promises: Promise<O>[]): Promise<O[]> {
  const SIZE = 50;
  const out: O[] = [];
  for (let i = 0; i < promises.length; i += SIZE) {
    out.push(...(await Promise.all(promises.slice(i, i + SIZE))));
  }
  return out;
}

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

/** System prompt, you can update it to provide more specific information */
const systemPrompt = [
  'You are an AI assistant for the CCXT cryptocurrency trading library documentation.',
  'Use the `search` tool to retrieve relevant docs context before answering when needed.',
  'The `search` tool returns raw JSON results from documentation. Use those results to ground your answer and cite sources as markdown links using the document `url` field when available.',
  'If you cannot find the answer in search results, say you do not know and suggest a better search query.',
].join('\n');

export async function POST(req: Request, ctx: RouteContext<"/api/chat">) {
  const reqJson = await req.json();

  const result = streamText({
    model: openrouter.chat(process.env.OPENROUTER_MODEL ?? 'inclusionai/ling-2.6-flash'),
    // Disable extended thinking — hybrid reasoning models (e.g. GLM) otherwise stream
    // their chain-of-thought into the answer. No-op for plain instruct models.
    providerOptions: {
      openrouter: {
        reasoning: { enabled: false },
      },
    },
    stopWhen: stepCountIs(5),
    tools: {
      search: searchTool,
    },
    messages: [
      { role: 'system', content: systemPrompt },
      ...(await convertToModelMessages<ChatUIMessage>(reqJson.messages ?? [], {
        convertDataPart(part) {
          if (part.type === 'data-client')
            return {
              type: 'text',
              text: `[Client Context: ${JSON.stringify(part.data)}]`,
            };
        },
      })),
    ],
    toolChoice: 'auto',
  });

  return result.toUIMessageStreamResponse();
}

// CCXT doc pages are huge (per-exchange method tables), so returning enriched
// docs verbatim can exceed 700k tokens and overflow any model's context window.
// Cap the result count and snippet each page's content to keep the tool payload small.
const MAX_RESULTS = 6;
const SNIPPET_CHARS = 1200;

const searchTool = tool({
  description: 'Search the docs content and return JSON results (title, url, description, content snippet).',
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().int().min(1).max(MAX_RESULTS).default(MAX_RESULTS),
  }),
  async execute({ query, limit }) {
    const search = await searchServer;
    const results = await search.searchAsync(query, {
      limit: Math.min(limit, MAX_RESULTS),
      merge: true,
      enrich: true,
    });
    return (results as Array<{ id?: string; doc?: CustomDocument }>).map((r) => {
      const doc = (r.doc ?? r) as CustomDocument;
      const content = typeof doc.content === 'string' ? doc.content.slice(0, SNIPPET_CHARS) : undefined;
      return { url: doc.url, title: doc.title, description: doc.description, content };
    });
  },
}) satisfies SearchTool;