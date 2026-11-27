import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CLIENT_CAPABILITIES_META_KEY } from '@modelcontextprotocol/server';
import type { McpServer, ClientCapabilities, ServerContext as ToolRequestContext } from '@modelcontextprotocol/server';
import { jsonStringify, type Envelope } from './format.js';
import { redact } from './redact.js';

// MCP Apps (io.modelcontextprotocol/ui, spec 2026-01-26): a tool advertises a ui:// resource
// in its _meta, the host fetches that HTML with resources/read and renders it in a sandboxed
// iframe, then pushes the tool result into it over postMessage. Hosts without the extension
// ignore the _meta and get the text content only, so every render tool stays usable as a
// plain tool. The wire format is three constants and one _meta shape, implemented by hand so
// the server keeps a single MCP SDK dependency.
export const UI_EXTENSION_ID = 'io.modelcontextprotocol/ui';
export const UI_MIME_TYPE = 'text/html;profile=mcp-app';

export type ViewName = 'chart' | 'orderbook' | 'tickers';

export interface ViewSource {
    name: string; // resource name in resources/list
    slug: string; // first part of the ui:// file name
    file: string; // template under ./ui
    title: string;
    description: string;
}

export const VIEW_SOURCES: Readonly<Record<ViewName, ViewSource>> = Object.freeze ({
    'chart': {
        'name': 'ccxt-chart',
        'slug': 'chart',
        'file': 'chart.html',
        'title': 'CCXT candlestick chart',
        'description': 'Interactive candlestick + volume chart rendered by show_chart',
    },
    'orderbook': {
        'name': 'ccxt-orderbook',
        'slug': 'orderbook',
        'file': 'orderbook.html',
        'title': 'CCXT order book',
        'description': 'Interactive depth chart and price ladder rendered by show_orderbook',
    },
    'tickers': {
        'name': 'ccxt-tickers',
        'slug': 'tickers',
        'file': 'tickers.html',
        'title': 'CCXT price board',
        'description': 'Sortable 24h price board rendered by show_tickers',
    },
});

// one view as served: its versioned URI and the rendered document it names
export interface UiView extends ViewSource {
    uri: string;
    html: string;
}

export type ViewCatalog = Readonly<Record<ViewName, UiView>>;

export type AssetReader = (file: string) => string;

const here = path.dirname (fileURLToPath (import.meta.url));
// file names are only ever the constants above and @include targets matching INCLUDE_PATTERN,
// never request input. Under tsx this is ts/ui, compiled it is js/ui (scripts/copy-ui.mjs)
const ASSET_NAME = /^[a-z0-9][a-z0-9.-]*$/;

export function readUiAsset (file: string): string {
    if (!ASSET_NAME.test (file)) {
        throw new Error ('invalid view asset name: ' + file);
    }
    return fs.readFileSync (path.join (here, 'ui', file), 'utf8');
}

const INCLUDE_PATTERN = /\/\*\s*@include\s+([a-z0-9.-]+)\s*\*\//g;

// Views are authored as one HTML file each plus shared fragments (shared.css, bridge.js,
// table.js). Hosts load a view as a single document under a CSP that blocks every external
// origin, so the fragments are inlined instead of linked. A function replacer is used
// because the fragments contain "$" sequences that String.replace would otherwise treat as
// substitution patterns.
export function renderView (file: string, read: AssetReader = readUiAsset): string {
    return read (file).replace (INCLUDE_PATTERN, (_match, include) => read (include));
}

// Hosts cache a view by its URI (ChatGPT for up to an hour, and OpenAI's guidance is to
// publish a new URI for every change), so the URI carries a hash of the exact document it
// names: a changed view is a new URI and no host can pair new tool results with stale HTML.
export function viewUri (slug: string, html: string): string {
    const hash = crypto.createHash ('sha256').update (html, 'utf8').digest ('hex').slice (0, 12);
    return 'ui://ccxt/' + slug + '.' + hash + '.html';
}

export function buildViewCatalog (read: AssetReader = readUiAsset): ViewCatalog {
    const catalog: Record<string, UiView> = {};
    for (const [ key, source ] of Object.entries (VIEW_SOURCES)) {
        const html = renderView (source.file, read);
        catalog[key] = { ...source, html, 'uri': viewUri (source.slug, html) };
    }
    return Object.freeze (catalog) as ViewCatalog;
}

let defaultCatalog: ViewCatalog | undefined = undefined;

// rendered and hashed once per process, on first use (the shared state asks at startup)
export function defaultViewCatalog (): ViewCatalog {
    if (defaultCatalog === undefined) {
        defaultCatalog = buildViewCatalog ();
    }
    return defaultCatalog;
}

// the nested key is the standard; the flat key is its deprecated predecessor that some hosts
// still read, and openai/outputTemplate is the alias ChatGPT honours. All three name the
// same versioned resource, so a host picks whichever it understands
export function uiToolMeta (view: UiView): Record<string, any> {
    return {
        'ui': { 'resourceUri': view.uri },
        'ui/resourceUri': view.uri,
        'openai/outputTemplate': view.uri,
    };
}

// Only the current URI of each view is registered, so resources/list and resources/read
// agree with the tools' _meta, and a URI from before a change is "resource not found"
// rather than a different document under an old name.
// A view's URI embeds its content hash, so a document read under it never changes: on the
// hosted server it may be cached publicly for a day.
export const VIEW_CACHE_HINT = Object.freeze ({ 'ttlMs': 86400000, 'cacheScope': 'public' as const });

// Deep-merges per-request extras into a view's contents _meta: { ui: { prefersBorder } } plus,
// e.g., { ui: { domain } } stays one "ui" object
export function viewContentsMeta (base: Record<string, any>, extra: Record<string, any> | undefined): Record<string, any> {
    if (extra === undefined) {
        return base;
    }
    const merged: Record<string, any> = { ...base, ...extra };
    if (base['ui'] !== undefined && extra['ui'] !== undefined) {
        merged['ui'] = { ...base['ui'], ...extra['ui'] };
    }
    return merged;
}

export function registerUiResources (server: McpServer, catalog: ViewCatalog, options: { publicCache?: boolean, resourceMeta?: () => Record<string, any> | undefined } = {}): void {
    for (const view of Object.values (catalog)) {
        // the views are self-contained (no network, no external assets), so no csp block is
        // declared and the host applies its most restrictive default
        const meta = { 'ui': { 'prefersBorder': true } };
        server.registerResource (view.name, view.uri, {
            'title': view.title,
            'description': view.description,
            'mimeType': UI_MIME_TYPE,
            '_meta': meta,
            ...(options.publicCache ? { 'cacheHint': { ...VIEW_CACHE_HINT } } : {}),
        }, async (uri) => ({
            'contents': [ { 'uri': uri.href, 'mimeType': UI_MIME_TYPE, 'text': view.html, '_meta': viewContentsMeta (meta, options.resourceMeta?.()) } ],
        }));
    }
}

// ---- what the client can render -----------------------------------------------------------

// The client's capabilities for the request being handled, or undefined when the server
// cannot know them:
// - 2026-07-28 requests carry them in their own envelope (ctx.mcpReq.envelope, keyed by
//   CLIENT_CAPABILITIES_META_KEY), on stdio and HTTP alike;
// - a 2025-era long-lived connection (stdio) declared them once in initialize;
// - a 2025-era STATELESS HTTP request has neither: every request is its own connection
//   whose initialize the server never saw.
export function requestClientCapabilities (server: McpServer, request: ToolRequestContext | undefined): ClientCapabilities | undefined {
    const envelope: any = request?.mcpReq?.envelope;
    const fromEnvelope = envelope?.[CLIENT_CAPABILITIES_META_KEY];
    if (fromEnvelope !== undefined && fromEnvelope !== null) {
        return fromEnvelope as ClientCapabilities;
    }
    return server.server.getClientCapabilities () ?? undefined;
}

export type UiSupport = 'supported' | 'unsupported' | 'unknown';

// supported only when the client advertised the MCP Apps extension for our mime type
export function uiSupport (capabilities: ClientCapabilities | undefined): UiSupport {
    if (capabilities === undefined) {
        return 'unknown';
    }
    const extension = (capabilities as any)?.extensions?.[UI_EXTENSION_ID];
    const mimeTypes = extension?.mimeTypes;
    return (Array.isArray (mimeTypes) && mimeTypes.includes (UI_MIME_TYPE)) ? 'supported' : 'unsupported';
}

// ---- when a result carries its view payload -----------------------------------------------

// The mode (CCXT_MCP_UI on stdio, the hosted config otherwise):
//   auto   (default) the dataset goes to a client that advertised MCP Apps
//   always           to every client — the escape hatch for a host that renders MCP Apps
//                    views without advertising the capability
//   off              never; the show_* tools stay listed and answer with the summary
// Only the MCP Apps extension makes structuredContent view-only: under the base protocol a
// host without it may hand structuredContent to the model INSTEAD of the text summary
// (Claude Code does), so the dataset is not sent on the off chance that something renders it.
export type UiMode = 'auto' | 'always' | 'off';

// What auto mode does when the client's capabilities are unknown (a 2025-era request to a
// stateless HTTP server, see requestClientCapabilities):
//   attach  send the dataset — the hosted default: that is how Claude and ChatGPT reach a
//           remote server today, and both render views; the payload is kept compact for
//           the hosts that do not
//   omit    send the summary only — the stdio default: a stdio connection always knows its
//           client's capabilities, so "unknown" there is an anomaly, not a host to cater for
export type UiWhenUnknown = 'attach' | 'omit';

export interface UiPolicy {
    mode: UiMode;
    whenUnknown: UiWhenUnknown;
}

export function parseUiMode (value: string | undefined): UiMode | undefined {
    const normalized = (value ?? '').trim ().toLowerCase ();
    return (normalized === 'auto' || normalized === 'always' || normalized === 'off') ? normalized : undefined;
}

export function parseUiWhenUnknown (value: string | undefined): UiWhenUnknown | undefined {
    const normalized = (value ?? '').trim ().toLowerCase ();
    return (normalized === 'attach' || normalized === 'omit') ? normalized : undefined;
}

// anything else — unset, empty, a typo, an unsubstituted "${user_config.ui}" plugin
// template — is the safe default
export function uiModeFromEnv (env: NodeJS.ProcessEnv = process.env): UiMode {
    return parseUiMode (env['CCXT_MCP_UI']) ?? 'auto';
}

// what a show_* result reports as meta.ui (and as structuredContent.ui):
//   displayed    the dataset is attached and the client declared it renders MCP Apps (or the
//                operator forced views with mode "always")
//   attached     the dataset is attached although the client's capabilities are unknown
//   unsupported  the client declared capabilities without MCP Apps — summary only
//   unknown      the client's capabilities are unknown and the policy omits — summary only
//   off          views are disabled on this server — summary only
export const UI_STATUSES = [ 'displayed', 'attached', 'unsupported', 'unknown', 'off' ] as const;
export type UiStatus = typeof UI_STATUSES[number];

export function decideUiStatus (policy: UiPolicy, support: UiSupport): UiStatus {
    if (policy.mode === 'off') {
        return 'off';
    }
    if (policy.mode === 'always' || support === 'supported') {
        return 'displayed';
    }
    if (support === 'unsupported') {
        return 'unsupported';
    }
    return (policy.whenUnknown === 'attach') ? 'attached' : 'unknown';
}

export function attachesView (status: UiStatus): boolean {
    return status === 'displayed' || status === 'attached';
}

// the trailing notice of a show_* result: what happened to the view and what the model
// should do about it. The stdio hints name the local switch; a hosted caller cannot use it
export function uiNotice (status: UiStatus, fallbackTool: string, hosted: boolean): string {
    const fallback = fallbackTool + ' returns the full dataset';
    if (status === 'displayed') {
        return 'an interactive view of this data is displayed to the user — do not repeat the full dataset in text; comment on the summary instead';
    }
    if (status === 'attached') {
        return 'an interactive view was sent, but this client did not declare whether it renders MCP Apps views — comment on the summary and state its key figures briefly in case the user sees no view (' + fallback + ')';
    }
    const summaryOnly = 'describe the summary in text (' + fallback + ')';
    if (status === 'off') {
        return 'interactive views are disabled on this server, so no view was sent — ' + summaryOnly;
    }
    if (status === 'unknown') {
        return 'this client did not declare its capabilities with the request, so no interactive view was sent — ' + summaryOnly;
    }
    return 'this host did not advertise MCP Apps UI support, so no interactive view was sent — ' + summaryOnly + (hosted ? '' : '; a host that does render MCP Apps views can be forced with CCXT_MCP_UI=always');
}

// ---- the result itself --------------------------------------------------------------------

export interface UiPayload {
    envelope: Envelope; // what the model reads — a compact summary, never the full dataset
    structured: Record<string, any>; // structuredContent: the view payload (see tools/ui.ts)
}

export type UiToolResult = { content: { type: 'text', text: string }[], structuredContent: Record<string, any> };

export function isUiPayload (value: any): value is UiPayload {
    return value !== null && typeof value === 'object' && value.envelope !== undefined && value.structured !== undefined;
}

// The view payload goes through the same redaction choke point as every text result, but
// leaf by leaf: redacting the serialized JSON would also rewrite a digit-only secret (a
// numeric uid) found inside a timestamp or price and leave unparseable JSON behind. Numbers
// are never credentials, so only strings and keys are redacted; undefined and non-finite
// numbers are normalized the way JSON serialization would.
export function redactDeep (value: any): any {
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
        'structuredContent': redactDeep (payload.structured),
    };
}
