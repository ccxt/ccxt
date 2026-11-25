import http from 'http';
import { randomUUID } from 'crypto';
import os from 'os';
import path from 'path';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer, createSharedState, type CreateServerOptions, type SharedState } from './factory.js';
import { HOSTED_SERVER_INSTRUCTIONS } from './tools/index.js';
import { createBrowserTradingRoute, registerBrowserTrading, type BrowserTradingOptions, type SigningLogRecord } from './browser-trading.js';
import { registerBrowserSigning, signStep } from './browser-signing.js';
import { log } from './logging.js';
import { instrumentServer } from './posthog.js';
import type { PostHog } from 'posthog-node';
import type { PoolsDeps } from './pools.js';
import type { ResolvedConfig } from './types.js';
import { requestContext, type ToolCallRecord, type HtmlServedRecord } from './request-context.js';

// Appended when the browser-signing tools are registered. The base hosted instructions say the
// server cannot trade and has no accounts — true of the server itself, but without this a model
// reads it as "refuse orders" and never calls the browser_* tools.
const BROWSER_TRADING_INSTRUCTIONS = `

Exception — browser-signed requests on Binance and Bybit: for placing or cancelling an order, or reading the user's balance or swap positions, call browser_create_order, browser_cancel_order, browser_fetch_balance or browser_fetch_positions. These do not execute anything and need no account here: each returns a review widget where the user enters their API key in their own browser and signs the request there. Pass only the request details (exchange, network, market, symbol, side, type, amount, price). Still never ask for or accept API keys in chat.

Be fast with these four tools: make the browser_* call your FIRST and ONLY tool call for the request. Do not call search_markets, describe_exchange, describe_method, read_market_widget or resources/read before or after it, and do not look up prices first — the widget needs nothing else. Write the symbol yourself in unified form from what the user said ("BTC/USDT" for spot, "BTC/USDT:USDT" for a USDT-margined swap). After the tool returns, reply with one short sentence at most: the widget shows the review, the signing and the outcome, so do not repeat the order details or explain the steps. If these tools are missing from your tool list, tell the user to refresh this connection's tools — do not substitute a plain link.`;

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_BODY_BYTES = 1024 * 1024;

// The hosted server's config is built in code and is ALWAYS account-free. It deliberately
// never goes through loadConfig (), so no config file and no environment variable can hand
// this process a credential.
export function hostedConfig (): ResolvedConfig {
    return {
        'accounts': {},
        'settings': {
            'refreshMarketsTimeout': DAY_MS,
            'maxResults': 100,
            'strictPermissions': false,
            'exchangeOptions': {},
            'maxSubscriptions': 0,
            'hideDisabledTools': true,
            'loadEnvKeys': false,
            'publicRestOnly': true,
        },
        'problems': [],
        'configPath': undefined,
    };
}

export interface HostedOptions {
    ccxtModule: any;
    poolsDeps: PoolsDeps;
    version: string;
    browserTrading?: BrowserTradingOptions;
    posthog?: PostHog; // when set, MCP requests are reported to PostHog (see posthog.ts)
    path?: string; // MCP endpoint path, default /mcp
    allowedHosts?: string[]; // when set, requests whose Host header is not listed are refused
    router?: any; // tests inject a fake router
    journalDir?: string;
    accessLog?: boolean; // one line per HTTP request and per tool call, default true
    trustProxy?: boolean; // take the caller IP from X-Forwarded-For (only behind a proxy you control)
    onAccessLog?: (entry: AccessLogEntry) => void; // replaces the stderr sink (tests)
}

// "http": one per HTTP request (not /health), carrying the JSON-RPC method and, for a
// tools/call, the tool name — so requests that never reach a tool handler (initialize,
// tools/list, calls rejected by argument validation) are still identifiable.
// "call": one per tool call. "html": one each time a widget HTML file is served (through
// resources/read or the read_market_widget tool), with the file's path on disk. All three
// are tied together by requestId. Of a call's arguments only the targeted symbol(s) are logged; results never are.
export interface AccessLogEntry {
    event: 'http' | 'html' | 'call' | 'signing';
    requestId: string;
    ip: string | undefined;
    ms: number;
    method?: string;
    path?: string;
    status?: number;
    rpc?: string; // JSON-RPC method(s) of the request body, e.g. "tools/call" (comma-separated for a batch)
    tool?: string;
    exchange?: string;
    ok?: boolean;
    code?: string;
    uri?: string; // html: the ui:// resource requested
    file?: string; // html: the file on disk that was served
    bytes?: number;
    via?: 'resource' | 'tool';
    served?: string[]; // http: paths of the html files this request served, if any
    symbols?: string[]; // http + call: the symbol(s) the tool call targets, e.g. ["BTC/USDT"]
    signing?: SigningLogRecord; // signing: one step of the browser signing flow (page served, relay outcome)
}

// what the access log records about a request body; filled in once the body is parsed
interface RpcInfo {
    rpc?: string;
    tool?: string;
    symbols?: string[];
    served?: string[];
}

const MAX_LOGGED_SYMBOLS = 20;

// the symbol(s) a tool call targets: the "symbol" / "symbols" arguments, or the first
// positional argument of call_read_method (e.g. fetchFundingRate ["BTC/USDT"]). Caller-
// controlled, so bounded in count and length.
function targetedSymbols (toolName: string, args: any): string[] | undefined {
    if (args === null || typeof args !== 'object') {
        return undefined;
    }
    const found: any[] = [];
    if (typeof args.symbol === 'string') {
        found.push (args.symbol);
    }
    if (Array.isArray (args.symbols)) {
        found.push (...args.symbols);
    }
    if (found.length === 0 && toolName === 'call_read_method' && Array.isArray (args.args)) {
        const first = args.args[0];
        found.push (...(Array.isArray (first) ? first : [ first ]));
    }
    const symbols = found.filter ((item) => typeof item === 'string' && item !== '').slice (0, MAX_LOGGED_SYMBOLS).map ((item: string) => item.slice (0, 50));
    return (symbols.length > 0) ? symbols : undefined;
}

// the body is caller-controlled: keep only method names, a tools/call's tool name and the
// symbol(s) it targets — all capped, no other arguments
function describeRpc (body: any, info: RpcInfo): void {
    const messages = Array.isArray (body) ? body : [ body ];
    const methods: string[] = [];
    for (const message of messages) {
        if (message !== null && typeof message === 'object' && typeof message.method === 'string') {
            methods.push (message.method);
            if (message.method === 'tools/call' && info.tool === undefined && typeof message.params?.name === 'string') {
                info.tool = message.params.name.slice (0, 100);
                info.symbols = targetedSymbols (message.params.name, message.params.arguments);
            }
        }
    }
    if (methods.length > 0) {
        info.rpc = methods.join (',').slice (0, 200);
    }
}

// reads the request body up to a hard cap; undefined means it was over the cap
async function readBody (req: http.IncomingMessage, limit: number): Promise<Buffer | undefined> {
    if (Number (req.headers['content-length'] ?? 0) > limit) {
        return undefined;
    }
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req) {
        size += chunk.length;
        if (size > limit) {
            return undefined;
        }
        chunks.push (chunk);
    }
    return Buffer.concat (chunks);
}

function callerIp (req: http.IncomingMessage, trustProxy: boolean): string | undefined {
    if (trustProxy) {
        const forwarded = req.headers['x-forwarded-for'];
        const first = (Array.isArray (forwarded) ? forwarded[0] : forwarded)?.split (',')[0]?.trim ();
        if (first) {
            return first;
        }
    }
    return req.socket.remoteAddress;
}

export interface HostedApp {
    httpServer: http.Server;
    shared: SharedState;
    close: () => Promise<void>;
}

function sendJson (res: http.ServerResponse, status: number, body: any, headers: Record<string, string> = {}): void {
    res.writeHead (status, { 'Content-Type': 'application/json', ...headers });
    res.end (JSON.stringify (body));
}

function rpcError (res: http.ServerResponse, status: number, message: string, headers: Record<string, string> = {}): void {
    sendJson (res, status, { 'jsonrpc': '2.0', 'error': { 'code': -32000, message }, 'id': null }, headers);
}

// Stateless Streamable HTTP: every POST gets a fresh McpServer + transport (the SDK's
// stateless pattern — nothing to leak between callers), while the exchange pools, markets
// cache and per-exchange rate limiters are shared process-wide.
export function createHostedApp (options: HostedOptions): HostedApp {
    const config = hostedConfig ();
    const serverOptions: CreateServerOptions = {
        config,
        'browserTradingEnabled': options.browserTrading !== undefined,
        'browserFrameOrigin': options.browserTrading?.frameAncestors?.length
            ? new URL (options.browserTrading.origin).origin : undefined,
        'ccxtModule': options.ccxtModule,
        'poolsDeps': options.poolsDeps,
        'version': options.version,
        'router': options.router,
        // no mutating tool is registered here, so nothing is ever journaled — keep the
        // (unused) journal out of any home directory
        'journalDir': options.journalDir ?? path.join (os.tmpdir (), 'ccxt-mcp-hosted-journal'),
        'instructions': (options.browserTrading !== undefined) ? HOSTED_SERVER_INSTRUCTIONS + BROWSER_TRADING_INSTRUCTIONS : HOSTED_SERVER_INSTRUCTIONS,
    };
    const shared = createSharedState (serverOptions);
    const posthog = options.posthog;
    if (posthog !== undefined) {
        log ('info', 'PostHog instrumentation active: every MCP request will be reported');
        posthog.capture ({ 'distinctId': 'ccxt-mcp-server', 'event': 'ccxt_mcp_server_started', 'properties': { 'version': options.version, '$process_person_profile': false } });
        posthog.flush ().then (
            () => log ('info', 'PostHog flush complete'),
            (error: any) => log ('warning', 'PostHog flush failed: ' + String (error?.message ?? error)),
        );
    }
    const endpoint = options.path ?? '/mcp';
    const allowedHosts = (options.allowedHosts !== undefined && options.allowedHosts.length > 0) ? options.allowedHosts : undefined;

    const accessLog = options.accessLog !== false;
    const trustProxy = options.trustProxy === true;
    const sink = options.onAccessLog ?? ((entry: AccessLogEntry) => log ('info', entry.event, entry));
    const emit = (entry: AccessLogEntry): void => {
        if (accessLog) {
            sink (entry);
        }
    };

    const reportSigning = (signing: SigningLogRecord): void => {
        // same requestId as the request's http line, so the two can be joined
        const context = requestContext.getStore ();
        emit ({ 'event': 'signing', 'requestId': context?.requestId ?? '', 'ip': context?.ip, 'ms': signing.upstreamMs ?? 0, signing });
    };
    const browserRoute = options.browserTrading && createBrowserTradingRoute (options.browserTrading, readBody, reportSigning);
    const handleMcp = async (req: http.IncomingMessage, res: http.ServerResponse, info: RpcInfo): Promise<void> => {
        // the body is read here (not by the transport) so the access log can name the
        // JSON-RPC method; that makes the size cap and the parse error ours to enforce
        const raw = await readBody (req, MAX_BODY_BYTES);
        if (raw === undefined) {
            // answer first and let the rest of the upload drain briefly, so the caller reads
            // the 413 instead of a reset connection; then drop the socket
            req.resume ();
            res.on ('finish', () => setTimeout (() => req.destroy (), 1000).unref ());
            rpcError (res, 413, 'request body too large — the limit is ' + MAX_BODY_BYTES + ' bytes', { 'Connection': 'close' });
            return;
        }
        let body: any;
        try {
            body = JSON.parse (raw.toString ('utf8'));
        } catch (e) {
            sendJson (res, 400, { 'jsonrpc': '2.0', 'error': { 'code': -32700, 'message': 'parse error — the body is not valid JSON' }, 'id': null });
            return;
        }
        describeRpc (body, info);
        const { server } = createServer ({ ...serverOptions, shared });
        if (options.browserTrading) {
            // the widget signs in place — no nested frame, no browser request. It reaches the signing
            // steps through browser_sign_step, or through the browser_* tool that mounted it
            const signingDeps = { 'exchangeClass': (id: string) => options.poolsDeps.exchangeClass (id), 'report': reportSigning };
            registerBrowserTrading (server, options.browserTrading, (input) => signStep (signingDeps, input));
            registerBrowserSigning (server, signingDeps);
        }
        // after every tool is registered, so all of them are covered
        if (posthog !== undefined) {
            instrumentServer (server, posthog);
        }

        const transport = new StreamableHTTPServerTransport ({
            'sessionIdGenerator': undefined, // stateless
            'enableJsonResponse': true, // plain JSON replies (curl-friendly), no SSE stream
            allowedHosts,
            'enableDnsRebindingProtection': allowedHosts !== undefined,
        });
        res.on ('close', () => {
            void transport.close ();
            void server.close ();
        });
        await server.connect (transport);
        await transport.handleRequest (req, res, body);
    };

    const httpServer = http.createServer ((req, res) => {
        const url = (req.url ?? '/').split ('?')[0];
        if (url === '/health') {
            sendJson (res, 200, { 'status': 'ok', 'version': options.version });
            return;
        }
        const info: RpcInfo = {};
        const started = Date.now ();
        const requestId = randomUUID ();
        const ip = callerIp (req, trustProxy);
        res.on ('close', () => {
            // the path is caller-controlled: cap it so a log line stays one bounded line
            emit ({ 'event': 'http', requestId, ip, 'ms': Date.now () - started, 'method': req.method, 'path': url.slice (0, 200), 'status': res.statusCode, 'rpc': info.rpc, 'tool': info.tool, 'symbols': info.symbols, 'served': info.served });
        });
        const onToolCall = (record: ToolCallRecord): void => emit ({ 'event': 'call', requestId, ip, ...record, 'exchange': record.exchange?.slice (0, 100), 'symbols': info.symbols });
        const onHtmlServed = (record: HtmlServedRecord): void => {
            // also carried on the request's own http line, so that line names the file it served
            info.served = [ ...(info.served ?? []), record.file ];
            emit ({ 'event': 'html', requestId, ip, 'ms': Date.now () - started, ...record });
        };
        requestContext.run ({ requestId, ip, onToolCall, onHtmlServed }, () => route (req, res, url, info));
    });

    const route = (req: http.IncomingMessage, res: http.ServerResponse, url: string, info: RpcInfo): void => {
        if (browserRoute && [ '/order-signing', '/order-signing/ccxt.js', '/order-signing/app.js', '/relay-order' ].includes (url)) {
            void browserRoute (req, res, url);
            return;
        }
        if (url !== endpoint) {
            rpcError (res, 404, 'not found — the MCP endpoint is ' + endpoint);
            return;
        }
        if (req.method !== 'POST') {
            // stateless: there is no session to stream on (GET) or to end (DELETE)
            rpcError (res, 405, 'method not allowed — POST JSON-RPC to ' + endpoint, { 'Allow': 'POST' });
            return;
        }
        handleMcp (req, res, info).catch ((error: any) => {
            log ('error', 'request failed: ' + String (error?.stack ?? error));
            if (!res.headersSent) {
                rpcError (res, 500, 'internal server error');
            } else {
                res.end ();
            }
        });
    };

    const close = async (): Promise<void> => {
        await new Promise<void> ((resolve) => {
            httpServer.close (() => resolve ());
            httpServer.closeAllConnections ();
        });
        await shared.subscriptions.closeAll ();
        await shared.pools.closeAll ();
    };

    return { httpServer, shared, close };
}
