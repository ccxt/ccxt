import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { readWidgetPage, widgetFile, widgetPath } from './widget-files.js';
import { browserWidgetUri, previousBrowserWidgetV3Uri, previousBrowserWidgetV2Uri, previousBrowserWidgetUri, readWidget, widgetMimeType } from './market-widget.js';

export interface BrowserTradingOptions {
    origin: string;
    // when set, /relay-order requires this token (or the session cookie issued for it); when
    // absent the relay accepts any request from the signing origin to an allowlisted route
    token?: string;
    // origins allowed to embed the signing page in an iframe (CSP frame-ancestors sources), so an
    // MCP host can render it inline. Empty or absent = it can only be opened as its own tab.
    frameAncestors?: string[];
}

// The hosts that render MCP widgets, and the sandbox origins they render them in. Every ancestor
// of the signing page's frame has to be listed: the widget's sandbox origin AND the host page.
export const DEFAULT_FRAME_ANCESTORS = [
    'https://chatgpt.com', 'https://*.oaiusercontent.com',
    'https://claude.ai', 'https://*.claudemcpcontent.com',
];

const require = createRequire (import.meta.url);
const reviewFile = widgetFile ('order-signing.html');
const exchanges = z.enum ([ 'binance', 'bybit' ]);
const symbol = z.string ().regex (/^[A-Za-z0-9][A-Za-z0-9./:_-]{0,63}$/);
const positive = z.number ().finite ().positive ();
const actions = {
    'browser_create_order': {
        title: 'Review order',
        fields: { symbol, 'side': z.enum ([ 'buy', 'sell' ]), 'type': z.enum ([ 'limit', 'market' ]), 'amount': positive, 'price': positive.optional () },
    },
    'browser_cancel_order': {
        title: 'Review cancellation',
        fields: { symbol, 'orderId': z.string ().min (1).max (80) },
    },
    'browser_fetch_balance': { title: 'Review balance request', fields: {} },
    'browser_fetch_positions': { title: 'Review positions request', fields: { 'symbol': symbol.optional () } },
};

// The widget's signing steps. Passed in (not imported) so this file does not depend on browser-signing.ts.
export type WidgetSigner = (input: { intent?: unknown; session?: string; apiKey?: string; signatures?: { id: string; signature: string }[] }) => Promise<Record<string, any>>;

const signingField = z.object ({
    'session': z.string ().max (64).optional (),
    'apiKey': z.string ().max (200).optional (),
    'signatures': z.array (z.object ({ 'id': z.string ().max (64), 'signature': z.string ().max (128) })).max (8).optional (),
}).optional ().describe ('Internal: set only by the review widget while the user signs. Never set this yourself.');

export function registerBrowserTrading (server: McpServer, options: BrowserTradingOptions, signer?: WidgetSigner): void {
    // the launcher embeds the signing page, so the host has to allow that origin as a frame
    // source of the widget (MCP Apps: ui.csp.frameDomains; ChatGPT: openai/widgetCSP.frame_domains)
    const signingOrigin = new URL (options.origin).origin;
    const embeds = (options.frameAncestors ?? []).length > 0;
    for (const [ name, uri ] of [
        [ 'browser-trading-v4', browserWidgetUri ], [ 'browser-trading-v3', previousBrowserWidgetV3Uri ], [ 'browser-trading-v2', previousBrowserWidgetV2Uri ],
        [ 'browser-trading', previousBrowserWidgetUri ],
    ]) {
        server.registerResource (name, uri, { 'mimeType': widgetMimeType }, async () => ({
            'contents': [ await readWidget (uri, 'resource', embeds ? signingOrigin : undefined) ],
        }));
    }
    for (const [ action, { title, fields } ] of Object.entries (actions)) {
        server.registerTool (action, {
            title,
            'description': action === 'browser_create_order'
                ? 'Review a limit or market order on mainnet or testnet. Spot amount is in base currency. Supply a price only for limit orders. Call this directly as the only tool call — no market lookup first; the widget it shows handles signing and the result.'
                : 'Open a mainnet or testnet review widget for signing in the browser. Supply request details only. Call this directly as the only tool call; the widget handles signing and shows the result.',
            'inputSchema': { 'exchange': exchanges, 'network': z.enum ([ 'mainnet', 'testnet' ]).default ('mainnet').describe ('Defaults to mainnet. Select testnet when requested.'), 'market': z.enum ([ 'spot', 'swap' ]).default ('spot'), ...fields, ...((signer !== undefined) ? { 'signing': signingField } : {}) },
            // also callable by the widget it mounts: some hosts only let a widget call the tool that
            // rendered it, so the signing steps can go through this same tool (the "signing" field)
            '_meta': { 'ui': { 'resourceUri': browserWidgetUri, 'visibility': [ 'model', 'app' ] }, 'openai/outputTemplate': browserWidgetUri, 'openai/widgetAccessible': true },
            'annotations': { 'readOnlyHint': true },
        }, async (input: { exchange: string; network: 'mainnet' | 'testnet'; market: string; type?: string; price?: number; signing?: { session?: string; apiKey?: string; signatures?: { id: string; signature: string }[] } }) => {
            if (input.signing !== undefined && signer !== undefined) {
                const { signing, ...request } = input;
                const step = await signer ({ 'intent': { action, ...request }, ...signing });
                return { 'structuredContent': step, 'content': [ { 'type': 'text' as const, 'text': (step.status === 'sign') ? 'Waiting for the browser signature.' : (step.status === 'done') ? 'Completed in the review widget.' : 'The request failed in the review widget.' } ] };
            }
            if (action === 'browser_fetch_positions' && input.market !== 'swap') {
                return { 'isError': true, 'content': [ { 'type': 'text' as const, 'text': 'Select a swap market for positions.' } ] };
            }
            if (action === 'browser_create_order' && input.type === 'market' && input.price !== undefined) {
                return { 'isError': true, 'content': [ { 'type': 'text' as const, 'text': 'Market orders do not take a limit price.' } ] };
            }
            if (action === 'browser_create_order' && 'type' in input && input.type === 'limit' && typeof input.price !== 'number') {
                return { 'isError': true, 'content': [ { 'type': 'text' as const, 'text': 'A limit order requires a price.' } ] };
            }
            const url = new URL ('/order-signing', options.origin);
            url.hash = encodeURIComponent (JSON.stringify ({ action, title, ...input, 'signing': undefined }));
            // "inline" tells the launcher widget it may embed the signing page instead of only linking to it
            const { 'signing': _unused, ...shown } = input;
            const result = { title, action, ...shown, 'url': url.href, 'inline': embeds };
            return { 'structuredContent': result, 'content': [ { 'type': 'text' as const, 'text': title + ' (' + input.network + '): ' + url.href } ] };
        });
    }
}

const binanceSpot = [
    'GET /api/v3/exchangeInfo', 'GET /api/v3/time', 'GET /api/v3/account',
    'POST /api/v3/order', 'DELETE /api/v3/order',
];
const binanceSwap = [
    'GET /fapi/v1/exchangeInfo', 'GET /fapi/v1/time', 'GET /fapi/v1/leverageBracket',
    'GET /fapi/v2/balance', 'GET /fapi/v3/balance',
    'GET /fapi/v2/account', 'GET /fapi/v3/account', 'GET /fapi/v2/positionRisk', 'GET /fapi/v3/positionRisk',
    'POST /fapi/v1/order', 'DELETE /fapi/v1/order',
];
const bybit = [
    'GET /v5/market/instruments-info', 'GET /v5/market/time', 'GET /v5/account/info',
    'GET /v5/user/query-api', 'GET /v5/account/wallet-balance', 'GET /v5/position/list',
    'POST /v5/order/create', 'POST /v5/order/cancel',
];
const targets: Record<string, Record<string, readonly string[]>> = {
    'binance': {
        'api.binance.com': binanceSpot,
        'testnet.binance.vision': binanceSpot,
        'fapi.binance.com': binanceSwap,
        'demo-fapi.binance.com': binanceSwap,
    },
    'bybit': { 'api.bybit.com': bybit, 'api-testnet.bybit.com': bybit },
};

// the one allowlist for requests this server forwards to an exchange, whichever way they were signed
export function relayTargetAllowed (exchange: string, method: string, url: string): boolean {
    let target: URL;
    try {
        target = new URL (url);
    } catch {
        return false;
    }
    const hosts = Object.prototype.hasOwnProperty.call (targets, exchange) ? targets[exchange] : undefined;
    const paths = (hosts !== undefined && Object.prototype.hasOwnProperty.call (hosts, target.hostname)) ? hosts[target.hostname] : undefined;
    return target.protocol === 'https:' && !target.port && !target.username && !target.password && !target.hash &&
        paths !== undefined && paths.includes (method + ' ' + target.pathname);
}
const relayRequest = z.object ({
    'exchange': exchanges,
    'signedPayload': z.object ({
        'url': z.string ().max (8192),
        'method': z.enum ([ 'GET', 'POST', 'DELETE' ]),
        'headers': z.record (z.string ().max (8192)),
        'body': z.string ().max (32768).nullable (),
    }).strict (),
}).strict ();
const forwardedHeaders = new Set ([
    'content-type', 'x-mbx-apikey', 'x-bapi-api-key', 'x-bapi-sign',
    'x-bapi-timestamp', 'x-bapi-recv-window', 'x-bapi-sign-type',
]);

// One record per step of the signing flow, for the access log. It never carries a credential:
// no header values, no query strings (they hold the signature), no request or response bodies —
// only the exchange's own error code/message when it refuses a request.
export interface SigningLogRecord {
    step: 'page' | 'relay' | 'inline'; // inline: a request signed inside the widget (browser-signing.ts)
    path: string;
    status: number; // the HTTP status this server answered with
    outcome: string; // served | forwarded | refused | failed
    reason?: string; // why it was refused or failed
    file?: string;
    bytes?: number;
    session?: string; // page: whether a relay session cookie was issued, and why not
    embedded?: boolean; // page: true when it was requested as an iframe (rendered inline in a host)
    embedder?: string; // page: origin of the frame that embedded it (from Referer), when the browser sent one
    auth?: string; // relay: which credential was accepted (token | session), or that none is required
    exchange?: string;
    target?: string; // relay: METHOD host/path of the exchange request
    upstreamStatus?: number; // relay: the exchange's HTTP status
    exchangeCode?: string; // relay: the exchange's error code, when it reports one
    exchangeMessage?: string;
    upstreamMs?: number;
}

function embedderOf (referer: string | undefined): string {
    try {
        return (referer === undefined) ? '(no Referer sent)' : new URL (referer).origin.slice (0, 200);
    } catch {
        return '(unparseable Referer)';
    }
}

// the error code/message an exchange reply carries, if any (binance: code/msg, bybit: retCode/retMsg)
function exchangeError (body: string): { exchangeCode?: string; exchangeMessage?: string } {
    try {
        const parsed = JSON.parse (body);
        const code = parsed?.retCode ?? parsed?.code;
        const message = parsed?.retMsg ?? parsed?.msg;
        if (code === undefined || code === 0 || code === '0' || code === 200) return {};
        return { 'exchangeCode': String (code).slice (0, 40), 'exchangeMessage': (typeof message === 'string') ? message.slice (0, 200) : undefined };
    } catch {
        return {};
    }
}

export function createBrowserTradingRoute (options: BrowserTradingOptions, readBody: (req: IncomingMessage, maximum: number) => Promise<Buffer | undefined>, report: (record: SigningLogRecord) => void = () => undefined) {
    const origin = new URL (options.origin);
    const local = origin.protocol === 'http:' && [ '127.0.0.1', 'localhost', '[::1]' ].includes (origin.hostname);
    const requireToken = options.token !== undefined;
    const relayToken = options.token ?? '';
    if (origin.origin !== options.origin || (origin.protocol !== 'https:' && !local) || (requireToken && relayToken.length < 32)) {
        throw new Error ('Browser trading requires an HTTPS or loopback origin and, when a relay token is set, one of at least 32 characters');
    }
    const tokenDigest = createHash ('sha256').update ('Bearer ' + relayToken).digest ();
    const authorized = (authorization: string): boolean => timingSafeEqual (
        tokenDigest, createHash ('sha256').update (authorization).digest (),
    );
    const lifetime = 600;
    const signSession = (expiry: string): string => createHmac ('sha256', relayToken)
        .update ('ccxt-browser-relay:' + origin.origin + ':' + expiry).digest ('hex');
    const validSession = (cookie: string): boolean => {
        const match = /(?:^|;\s*)ccxt_relay=(\d{10})\.([a-f0-9]{64})(?:;|$)/.exec (cookie);
        return match !== null && Number (match[1]) > Math.floor (Date.now () / 1000) &&
            timingSafeEqual (Buffer.from (match[2]), Buffer.from (signSession (match[1])));
    };
    // CSP source expressions only — a stray quote or semicolon here would rewrite the policy
    const ancestors = (options.frameAncestors ?? []).filter ((source) => /^(\*|https?:\/\/[A-Za-z0-9.*:[\]-]+)$/.test (source));
    if (ancestors.length !== (options.frameAncestors ?? []).length) {
        throw new Error ('frameAncestors entries must be "*" or origins such as https://chatgpt.com or https://*.example.com');
    }
    const frameAncestors = (ancestors.length > 0) ? ancestors.join (' ') : "'none'";
    const seen = new Map<string, number> ();
    let bundle: Promise<Buffer> | undefined;
    return async (req: IncomingMessage, res: ServerResponse, path: string): Promise<void> => {
        const send = (status: number, payload: unknown): void => {
            res.writeHead (status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
            res.end (JSON.stringify (payload));
        };
        const step = (path === '/relay-order') ? 'relay' : 'page';
        // answers with an error and logs why — the page only ever shows the status code
        const refuse = (status: number, error: string, reason: string, extra: Partial<SigningLogRecord> = {}): void => {
            report ({ step, path, status, 'outcome': 'refused', reason, ...extra });
            send (status, { error });
        };
        let relayed: Partial<SigningLogRecord> = {};
        try {
            if (path === '/order-signing' || path === '/order-signing/ccxt.js' || path === '/order-signing/app.js') {
                if (req.method !== 'GET') return refuse (405, 'GET required', 'method ' + String (req.method) + ' is not GET');
                const html = path === '/order-signing';
                const ccxtBundle = path === '/order-signing/ccxt.js';
                const page = ccxtBundle ? undefined : await readWidgetPage (reviewFile, '/order-signing/app.js');
                const body = page === undefined ? await (bundle ??= readFile (join (dirname (require.resolve ('ccxt')), 'ccxt.browser.min.js')))
                    : Buffer.from (html ? page.html : page.script);
                const directLocalPage = local && req.headers.host === origin.host &&
                    [ '127.0.0.1', '::1', '::ffff:127.0.0.1' ].includes (req.socket.remoteAddress ?? '') &&
                    req.headers['sec-fetch-mode'] === 'navigate' && req.headers['sec-fetch-dest'] === 'document' &&
                    !req.headers.forwarded && !req.headers['x-forwarded-for'];
                const tokenPresented = requireToken && authorized (req.headers.authorization ?? '');
                let session: string | undefined;
                if (html && !requireToken) {
                    session = 'not needed — the relay token requirement is off';
                } else if (html) {
                    session = directLocalPage ? 'issued (direct loopback page load)' : tokenPresented ? 'issued (relay token presented)'
                        : 'not issued — ' + (!local ? 'not a loopback origin, so the page must send the relay token'
                            : req.headers.host !== origin.host ? 'Host ' + String (req.headers.host) + ' is not ' + origin.host
                                : 'not a direct top-level navigation from this machine');
                }
                if (html && requireToken && (directLocalPage || tokenPresented)) {
                    const expiry = String (Math.floor (Date.now () / 1000) + lifetime);
                    const secure = origin.protocol === 'https:' ? '; Secure' : '';
                    res.setHeader ('Set-Cookie', 'ccxt_relay=' + expiry + '.' + signSession (expiry) +
                        '; Path=/relay-order; Max-Age=' + lifetime + '; HttpOnly; SameSite=Strict' + secure);
                }
                res.writeHead (200, {
                    'Content-Type': html ? 'text/html; charset=utf-8' : 'text/javascript; charset=utf-8',
                    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
                    'Referrer-Policy': 'no-referrer',
                    'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors " + frameAncestors + "; base-uri 'none'; form-action 'none'",
                });
                res.end (body);
                report ({ step, path, 'status': 200, 'outcome': 'served', 'bytes': body.length, session,
                    'embedded': html ? (req.headers['sec-fetch-dest'] === 'iframe') : undefined,
                    // who is embedding it: the origin to add to frame-ancestors when the browser then blocks the frame
                    'embedder': (html && req.headers['sec-fetch-dest'] === 'iframe') ? embedderOf (req.headers.referer) : undefined,
                    'file': ccxtBundle ? 'ccxt.browser.min.js' : widgetPath (reviewFile) });
                return;
            }
            if (req.method !== 'POST') return refuse (403, 'Signing origin required', 'method ' + String (req.method) + ' is not POST');
            if (req.headers.origin !== origin.origin) {
                return refuse (403, 'Signing origin required', 'Origin ' + String (req.headers.origin ?? '(none)').slice (0, 200) + ' is not the signing origin ' + origin.origin);
            }
            const byToken = requireToken && authorized (req.headers.authorization ?? '');
            const bySession = requireToken && !byToken && validSession (req.headers.cookie ?? '');
            if (requireToken && !byToken && !bySession) {
                const presented = [
                    (req.headers.authorization !== undefined) ? 'a relay token that does not match' : 'no relay token',
                    /(?:^|;\s*)ccxt_relay=/.test (req.headers.cookie ?? '') ? 'a session cookie that is invalid or expired' : 'no session cookie',
                ];
                return refuse (401, 'Relay authorization failed', presented.join (', '));
            }
            const auth = !requireToken ? 'none (token requirement off)' : byToken ? 'token' : 'session';
            const raw = await readBody (req, 65536);
            if (raw === undefined) return refuse (413, 'Relay request too large', 'body over 65536 bytes', { auth });
            const parsed = relayRequest.safeParse (JSON.parse (raw.toString ('utf8')));
            if (!parsed.success) {
                const issues = parsed.error.issues.slice (0, 5).map ((issue) => issue.path.join ('.') + ': ' + issue.message).join ('; ');
                return refuse (400, 'Invalid relay request', 'body failed validation — ' + issues.slice (0, 300), { auth });
            }
            const { exchange, signedPayload: request } = parsed.data;
            const target = new URL (request.url);
            relayed = { auth, exchange, 'target': request.method + ' ' + target.host + target.pathname };
            const paths = Object.prototype.hasOwnProperty.call (targets[exchange], target.hostname) ? targets[exchange][target.hostname] : undefined;
            if (target.protocol !== 'https:' || target.port || target.username || target.password || target.hash ||
                !paths?.includes (request.method + ' ' + target.pathname)) {
                return refuse (403, 'Exchange endpoint is not enabled', (paths === undefined)
                    ? 'host ' + target.hostname + ' is not an allowed ' + exchange + ' host'
                    : 'route is not in the allowlist for ' + target.hostname, relayed);
            }
            const headers = new Headers ();
            for (const [ name, value ] of Object.entries (request.headers)) {
                if (forwardedHeaders.has (name.toLowerCase ())) headers.set (name, value);
            }
            if (request.method !== 'GET') {
                const now = Date.now ();
                for (const [ key, expiry ] of seen) if (expiry <= now) seen.delete (key);
                const digest = createHash ('sha256').update (JSON.stringify ([ exchange, request.method, target.href,
                    request.body, headers.get ('x-bapi-sign'), headers.get ('x-mbx-apikey') ])).digest ('hex');
                if (seen.has (digest)) return refuse (409, 'Request already forwarded; check exchange status', 'identical signed request was forwarded in the last 2 minutes', relayed);
                if (seen.size >= 10000) return refuse (429, 'Relay is busy', 'duplicate-detection table is full', relayed);
                seen.set (digest, now + 120000);
            }
            const sent = Date.now ();
            const upstream = await fetch (target, { 'method': request.method, headers,
                'body': request.body, 'redirect': 'error', 'signal': AbortSignal.timeout (10000) });
            const text = await upstream.text ();
            report ({ step, path, 'status': 200, 'outcome': 'forwarded', ...relayed, 'upstreamStatus': upstream.status,
                'upstreamMs': Date.now () - sent, 'bytes': text.length, ...exchangeError (text) });
            send (200, { 'status': upstream.status, 'body': text });
        } catch (error: any) {
            // names the failure (timeout, DNS, malformed JSON body, …) — the page is only told 502
            report ({ step, path, 'status': 502, 'outcome': 'failed', ...relayed,
                'reason': String (error?.name ?? 'Error') + ': ' + String (error?.cause?.code ?? error?.message ?? error).slice (0, 200) });
            send (502, { 'error': 'Relay could not confirm the outcome; check exchange status before retrying' });
        }
    };
}
