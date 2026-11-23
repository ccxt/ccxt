import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { run } from './tools/common.js';
import type { ErrorContext } from './errors.js';
import { ok, type Envelope } from './format.js';
import { log } from './logging.js';
import { requestContext, type HtmlServedRecord } from './request-context.js';

const widgetUri = 'ui://ccxt/market-data.html';
const candleUri = 'ui://ccxt/candles-v2.html';
const widgetMimeType = 'text/html;profile=mcp-app';
const widgetFile = new URL ('../widgets/market-data.html', import.meta.url);

function widgetToolMeta (uri: string) {
    return {
        'ui': { 'resourceUri': uri, 'visibility': [ 'model' ] },
        'openai/outputTemplate': uri,
    };
}

export const marketWidgetMeta = widgetToolMeta (widgetUri);
export const candleWidgetMeta = widgetToolMeta (candleUri);

// every time widget HTML is handed out: the hosted server writes it to the request's access
// log; under stdio (no request context) it is a plain stderr log line
function logHtmlServed (record: HtmlServedRecord): void {
    const request = requestContext.getStore ();
    if (request !== undefined) {
        request.onHtmlServed (record);
    } else {
        log ('info', 'html', record);
    }
}

async function readWidget (uri: string, via: 'resource' | 'tool') {
    const text = await readFile (widgetFile, 'utf8');
    logHtmlServed ({ uri, 'file': fileURLToPath (widgetFile), 'bytes': Buffer.byteLength (text), via });
    return {
        uri,
        'mimeType': widgetMimeType,
        text,
        '_meta': {
            'ui': { 'prefersBorder': true },
            'openai/widgetDescription': 'This widget displays the full CCXT market result. Once rendered, the widget is the entire response. If it cannot be displayed, return only a concise error.',
        },
    };
}

export function registerMarketWidget (server: McpServer): void {
    for (const [name, uri, title] of [
        [ 'market-data', widgetUri, 'CCXT market data' ],
        [ 'candles', candleUri, 'CCXT candlestick chart' ],
    ]) {
        server.registerResource (name, uri, {
            title,
            'mimeType': widgetMimeType,
        }, async () => ({
            'contents': [ await readWidget (uri, 'resource') ],
        }));
    }

    server.registerTool ('read_market_widget', {
        'title': 'Read CCXT widget HTML',
        'description': 'Inspect the HTML resource for a CCXT widget when your client only exposes tool calls. For market data or charts use the corresponding market-data tool.',
        'inputSchema': {
            'uri': z.enum ([ widgetUri, candleUri ]).describe ('widget URI advertised in the market-data tool metadata'),
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': false, 'idempotentHint': true },
    }, async ({ uri }) => run ({ 'tool': 'read_market_widget' }, async () => ok (await readWidget (uri, 'tool'))));
}

export async function runMarketWidget (context: ErrorContext, handler: () => Promise<Envelope>) {
    const result = await run (context, handler);
    return { ...result, '_meta': { 'marketWidget': context.tool } };
}
