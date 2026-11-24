import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { jsonStringify, type Envelope } from './format.js';
import { redact } from './redact.js';
import { readAsset } from './embedded.js';

// MCP Apps (io.modelcontextprotocol/ui, spec 2026-01-26): a tool advertises a ui:// resource
// in its _meta, the host fetches that HTML with resources/read and renders it in a sandboxed
// iframe, then pushes the tool result into it over postMessage. Hosts without the extension
// ignore the _meta and get the text content only (see uiMode below) — every UI tool
// therefore stays fully usable as a plain tool. The wire format is implemented by hand (it is three constants and one
// _meta shape) so the server keeps a single MCP SDK dependency: @modelcontextprotocol/ext-apps
// 2.x needs the v2 SDK packages, and this server is on @modelcontextprotocol/sdk 1.x.
export const UI_EXTENSION_ID = 'io.modelcontextprotocol/ui';
export const UI_MIME_TYPE = 'text/html;profile=mcp-app';

export interface UiView {
    name: string;
    uri: string;
    file: string;
    title: string;
    description: string;
}

export const UI_VIEWS: Record<string, UiView> = {
    'chart': {
        'name': 'ccxt-chart',
        'uri': 'ui://ccxt/chart.html',
        'file': 'chart.html',
        'title': 'CCXT candlestick chart',
        'description': 'Interactive candlestick + volume chart rendered by show_chart',
    },
    'orderbook': {
        'name': 'ccxt-orderbook',
        'uri': 'ui://ccxt/orderbook.html',
        'file': 'orderbook.html',
        'title': 'CCXT order book',
        'description': 'Interactive depth chart and price ladder rendered by show_orderbook',
    },
    'tickers': {
        'name': 'ccxt-tickers',
        'uri': 'ui://ccxt/tickers.html',
        'file': 'tickers.html',
        'title': 'CCXT price board',
        'description': 'Sortable 24h price board rendered by show_tickers',
    },
    'balance': {
        'name': 'ccxt-balance',
        'uri': 'ui://ccxt/balance.html',
        'file': 'balance.html',
        'title': 'CCXT account balance',
        'description': 'Account holdings with their estimated value rendered by show_balance',
    },
    'orders': {
        'name': 'ccxt-orders',
        'uri': 'ui://ccxt/orders.html',
        'file': 'orders.html',
        'title': 'CCXT orders',
        'description': 'Filterable list of an account\'s orders rendered by show_orders',
    },
    'positions': {
        'name': 'ccxt-positions',
        'uri': 'ui://ccxt/positions.html',
        'file': 'positions.html',
        'title': 'CCXT positions',
        'description': 'Open derivatives positions with PnL rendered by show_positions',
    },
};

// the nested key is the standard; the flat key is its deprecated predecessor that some hosts
// still read, and openai/outputTemplate is the alias ChatGPT honors — all three point at the
// same resource, so a host picks whichever it understands
export function uiToolMeta (view: UiView): Record<string, any> {
    return {
        'ui': { 'resourceUri': view.uri },
        'ui/resourceUri': view.uri,
        'openai/outputTemplate': view.uri,
    };
}

const INCLUDE_PATTERN = /\/\*\s*@include\s+([a-z0-9.-]+)\s*\*\//g;
const cache = new Map<string, string> ();

// Views are authored as one HTML file each plus two shared fragments (shared.css and
// bridge.js). Hosts load a view as a single document under a CSP that blocks every
// external origin, so the fragments are inlined here instead of being linked. A function
// replacer is used because the fragments contain "$" sequences that String.replace would
// otherwise treat as substitution patterns.
export function renderView (view: UiView): string {
    const cached = cache.get (view.file);
    if (cached !== undefined) {
        return cached;
    }
    const template = readAsset ('ui/' + view.file);
    const html = template.replace (INCLUDE_PATTERN, (_match, file) => readAsset ('ui/' + file));
    cache.set (view.file, html);
    return html;
}

export function registerUiResources (server: McpServer): void {
    for (const view of Object.values (UI_VIEWS)) {
        // the views are self-contained (no network, no external assets), so no csp block is
        // declared and the host applies its most restrictive default
        const meta = { 'ui': { 'prefersBorder': true } };
        server.registerResource (view.name, view.uri, {
            'title': view.title,
            'description': view.description,
            'mimeType': UI_MIME_TYPE,
            '_meta': meta,
        }, async (uri) => ({
            'contents': [ { 'uri': uri.href, 'mimeType': UI_MIME_TYPE, 'text': renderView (view), '_meta': meta } ],
        }));
    }
}

// true only when the connected host advertised the MCP Apps extension for our mime type
export function uiSupported (server: McpServer): boolean {
    const capabilities: any = server.server.getClientCapabilities ();
    const extension = capabilities?.extensions?.[UI_EXTENSION_ID];
    const mimeTypes = extension?.mimeTypes;
    return Array.isArray (mimeTypes) && mimeTypes.includes (UI_MIME_TYPE);
}

// CCXT_MCP_UI decides when a show_* result carries its view payload (structuredContent):
//   auto   (default) only for a host that advertised the MCP Apps extension
//   always           for every host — the escape hatch for one that renders MCP Apps views
//                    without advertising the capability
//   off              never; the show_* tools stay listed and answer with the text summary
// The payload is the full dataset. Only the MCP Apps extension makes structuredContent
// view-only: under the base protocol it is equivalent to the text content, and a host
// without the extension may hand it to the model INSTEAD of the compact summary (Claude
// Code does) — so it must never be sent on the off chance that something renders it.
export type UiMode = 'auto' | 'always' | 'off';

export function uiMode (): UiMode {
    // anything else — unset, empty, a typo, an unsubstituted "${user_config.ui}" plugin
    // template — is the safe default
    const value = (process.env['CCXT_MCP_UI'] ?? '').trim ().toLowerCase ();
    return (value === 'always' || value === 'off') ? value : 'auto';
}

// what a show_* result reports as meta.ui:
//   displayed    the view payload is attached to this result
//   unsupported  auto mode and the host did not advertise MCP Apps — text summary only
//   off          views are disabled by CCXT_MCP_UI=off — text summary only
export type UiStatus = 'displayed' | 'unsupported' | 'off';

export function uiStatus (server: McpServer): UiStatus {
    const mode = uiMode ();
    if (mode === 'off') {
        return 'off';
    }
    return (mode === 'always' || uiSupported (server)) ? 'displayed' : 'unsupported';
}

export interface UiPayload {
    envelope: Envelope; // what the model reads — a compact summary, never the full dataset
    view: Record<string, any>; // what the view renders — delivered as structuredContent (see uiResult)
}

export type UiToolResult = { content: { type: 'text', text: string }[], structuredContent?: Record<string, any>, isError?: boolean };

export function isUiPayload (value: any): value is UiPayload {
    return value !== null && typeof value === 'object' && value.envelope !== undefined && value.view !== undefined;
}

// The view payload goes through the same redaction choke point as every text result, but
// leaf by leaf: redacting the serialized JSON would also rewrite a digit-only secret (a
// numeric uid) found inside a timestamp or price and leave unparseable JSON behind. Numbers
// are never credentials, so only strings and keys are redacted; undefined and non-finite
// numbers are normalized the way JSON serialization would.
function redactDeep (value: any): any {
    if (typeof value === 'string') {
        return redact (value);
    }
    if (typeof value === 'number') {
        return Number.isFinite (value) ? value : null;
    }
    if (Array.isArray (value)) {
        return value.map ((item) => ((item === undefined) ? null : redactDeep (item)));
    }
    if (value !== null && typeof value === 'object') {
        const out: Record<string, any> = {};
        for (const [ key, item ] of Object.entries (value)) {
            if (item !== undefined) {
                out[redact (key)] = redactDeep (item);
            }
        }
        return out;
    }
    return value;
}

export function toUiContent (payload: UiPayload): UiToolResult {
    return {
        'content': [ { 'type': 'text', 'text': redact (jsonStringify (payload.envelope)) } ],
        'structuredContent': redactDeep (payload.view),
    };
}

// the one place that decides whether a show_* result carries its view payload: anything
// but "displayed" is returned as the plain envelope, i.e. an ordinary text-only tool result
export function uiResult (status: UiStatus, envelope: Envelope, view: Record<string, any>): Envelope | UiPayload {
    return (status === 'displayed') ? { envelope, view } : envelope;
}

export function uiNotice (status: UiStatus, fallbackTool: string): string {
    if (status === 'displayed') {
        return 'an interactive view of this data is displayed to the user — do not repeat the full dataset in text; comment on the summary instead';
    }
    const fallback = 'describe the summary in text (' + fallbackTool + ' returns the full dataset)';
    if (status === 'off') {
        return 'interactive views are disabled on this server (CCXT_MCP_UI=off), so no view was sent — ' + fallback;
    }
    return 'this host did not advertise MCP Apps UI support, so no interactive view was sent — ' + fallback + '; a host that does render MCP Apps views can be forced with CCXT_MCP_UI=always';
}
