import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { run } from './tools/common.js';
import type { ErrorContext } from './errors.js';
import { ok, type Envelope } from './format.js';
import { log } from './logging.js';
import { requestContext, type HtmlServedRecord } from './request-context.js';
import { readWidgetHtml, widgetFile, widgetPath } from './widget-files.js';

const widgetUri = 'ui://ccxt/market-data-v3.html';
const previousTableUri = 'ui://ccxt/market-data-v2.html';
const previousWidgetUri = 'ui://ccxt/market-data.html';
const candleUri = 'ui://ccxt/candles-v3.html';
const previousCandleUri = 'ui://ccxt/candles-v2.html';
// v4: the widget signs in place (no nested frame) — a new URI so hosts drop the cached v3
export const browserWidgetUri = 'ui://ccxt/browser-trading-v4.html';
export const previousBrowserWidgetV3Uri = 'ui://ccxt/browser-trading-v3.html';
export const previousBrowserWidgetV2Uri = 'ui://ccxt/browser-trading-v2.html';
export const previousBrowserWidgetUri = 'ui://ccxt/browser-trading.html';
const browserWidgetFile = widgetFile ('order-launcher.html');
export const widgetMimeType = 'text/html;profile=mcp-app';
const marketWidgetFile = widgetFile ('market-data.html');

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

export async function readWidget (uri: string, via: 'resource' | 'tool', frameOrigin?: string) {
    const browserReview = [ browserWidgetUri, previousBrowserWidgetV3Uri, previousBrowserWidgetV2Uri, previousBrowserWidgetUri ].includes (uri);
    const file = browserReview ? browserWidgetFile : marketWidgetFile;
    const text = await readWidgetHtml (file);
    logHtmlServed ({ uri, 'file': widgetPath (file), 'bytes': Buffer.byteLength (text), via });
    return {
        uri,
        'mimeType': widgetMimeType,
        text,
        '_meta': {
            'ui': { 'prefersBorder': true, ...(browserReview && frameOrigin
                ? { 'csp': { 'frameDomains': [ frameOrigin ] } } : {}) },
            ...(browserReview && frameOrigin
                ? { 'openai/widgetCSP': { 'connect_domains': [], 'resource_domains': [], 'frame_domains': [ frameOrigin ] } } : {}),
            'openai/widgetDescription': browserReview ? 'The user reviews, signs and submits the CCXT request inside this widget. The widget shows the outcome; do not repeat the request.' : 'This widget displays the full CCXT market result. Once rendered, the widget is the entire response. If it cannot be displayed, return only a concise error.',
        },
    };
}

export function registerMarketWidget (server: McpServer, browserTradingEnabled = false, frameOrigin?: string): void {
    for (const [name, uri, title] of [
        [ 'market-data', widgetUri, 'CCXT market data' ],
        [ 'market-data-v2', previousTableUri, 'CCXT market data (v2 URI)' ],
        [ 'market-data-original', previousWidgetUri, 'CCXT market data (original URI)' ],
        [ 'candles', candleUri, 'CCXT candlestick chart' ],
        [ 'candles-v2', previousCandleUri, 'CCXT candlestick chart (v2 URI)' ],
    ]) {
        server.registerResource (name, uri, {
            title,
            'mimeType': widgetMimeType,
        }, async () => ({
            'contents': [ await readWidget (uri, 'resource') ],
        }));
    }

    const availableWidgets: [string, ...string[]] = [ widgetUri, previousTableUri, previousWidgetUri, candleUri, previousCandleUri ];
    if (browserTradingEnabled) availableWidgets.push (browserWidgetUri, previousBrowserWidgetV3Uri, previousBrowserWidgetV2Uri, previousBrowserWidgetUri);
    server.registerTool ('read_market_widget', {
        'title': 'Read CCXT widget HTML',
        'description': 'Inspect the HTML resource for a CCXT widget when your client only exposes tool calls. Use the corresponding CCXT tool to obtain the data or review details for the widget.',
        'inputSchema': {
            'uri': z.enum (availableWidgets).describe ('widget URI advertised in the CCXT tool metadata'),
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': false, 'idempotentHint': true },
    }, async ({ uri }) => run ({ 'tool': 'read_market_widget' }, async () => ok (await readWidget (uri, 'tool', frameOrigin))));
}

export async function runMarketWidget (context: ErrorContext, handler: () => Promise<Envelope>) {
    const result = await run (context, handler);
    return { ...result, '_meta': { 'marketWidget': context.tool } };
}
