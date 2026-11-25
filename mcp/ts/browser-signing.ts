import { createHash, randomBytes } from 'node:crypto';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { relayTargetAllowed, type SigningLogRecord } from './browser-trading.js';
import { browserWidgetUri } from './market-widget.js';

// In-widget signing, with no nested frame and no browser request to this server.
//
// The widget holds the API secret and never sends it. This server runs the ccxt unified call
// with the user's API key and a dummy secret, and replaces ccxt's HMAC step: every time ccxt
// asks for a signature it gets a random placeholder, and the message is remembered. Just before
// a request carrying a placeholder would be sent, the call pauses and the tool returns the
// message(s) to the widget. The widget computes the real HMAC with WebCrypto and calls the tool
// again; the placeholders are swapped for the real signatures and the request goes out. ccxt then
// parses the reply as usual, so results and errors are the unified ccxt ones.

export const SIGN_STEP_TOOL = 'browser_sign_step';

const SESSION_LIFETIME = 120000;
const MAX_SESSIONS = 500;
const UPSTREAM_TIMEOUT = 10000;
const PLACEHOLDER_SECRET = 'held-in-the-browser';

export interface SigningDeps {
    exchangeClass: (exchangeId: string) => any;
    report?: (record: SigningLogRecord) => void;
    // test seam: the HTTP call to the exchange
    fetchUpstream?: (url: string, init: { method: string; headers: Record<string, string>; body: string | undefined }) => Promise<{ status: number; text: string }>;
}

interface Intent {
    action: 'browser_create_order' | 'browser_cancel_order' | 'browser_fetch_balance' | 'browser_fetch_positions';
    exchange: 'binance' | 'bybit';
    network: 'mainnet' | 'testnet';
    market: 'spot' | 'swap';
    symbol?: string;
    side?: 'buy' | 'sell';
    type?: 'limit' | 'market';
    amount?: number;
    price?: number;
    orderId?: string;
}

interface Need {
    id: string; // the placeholder standing in for the signature
    message: string; // base64 of the exact bytes to sign
    algorithm: 'HMAC-SHA256';
    encoding: 'hex' | 'base64';
}

type StepResult =
    | { status: 'sign'; session: string; need: Need[] }
    | { status: 'done'; result: Record<string, any> }
    | { status: 'error'; error: { title: string; code: string; message: string; uncertain: boolean } };

interface Session {
    id: string;
    intent: Intent;
    expires: number;
    needs: Map<string, Need>; // every placeholder ccxt was handed
    signatures: Map<string, string>; // placeholder -> real signature, from the widget
    // requests paused until the widget signs them — ccxt can have several in flight at once
    // (bybit checks two account endpoints in parallel), so this is a list, not a single slot
    waiters: { missing: Need[]; resume: () => void }[];
    notifyPaused: (() => void) | undefined;
    run: Promise<StepResult> | undefined;
    writeSent: boolean; // an order or cancel left this server
    writeAnswered: boolean; // …and the exchange answered it
}

const sessions = new Map<string, Session> ();

// What a request would otherwise fetch again every time, kept for a few minutes:
// - markets per exchange/network/market type (public data; the biggest download of a request)
// - per API key, the account-mode flags bybit checks with two signed requests before anything
//   else — remembering them saves a whole signing round trip through the host
const WARM_LIFETIME = 10 * 60 * 1000;
const warmMarkets = new Map<string, { markets: any; at: number }> ();
const warmAccount = new Map<string, { options: Record<string, any>; at: number }> ();
const ACCOUNT_FLAGS = [ 'enableUnifiedMargin', 'enableUnifiedAccount', 'unifiedMarginStatus' ];

function marketsKey (intent: Intent): string {
    return intent.exchange + '|' + intent.network + '|' + intent.market;
}

function accountKey (intent: Intent, apiKey: string): string {
    return intent.exchange + '|' + intent.network + '|' + createHash ('sha256').update (apiKey).digest ('hex');
}

function warmUp (exchange: any, intent: Intent, apiKey: string): void {
    const now = Date.now ();
    const markets = warmMarkets.get (marketsKey (intent));
    if (markets !== undefined && now - markets.at < WARM_LIFETIME && typeof exchange.setMarkets === 'function') {
        exchange.setMarkets (markets.markets);
    }
    const account = warmAccount.get (accountKey (intent, apiKey));
    if (account !== undefined && now - account.at < WARM_LIFETIME) {
        Object.assign (exchange.options, account.options);
    }
}

function remember (exchange: any, intent: Intent, apiKey: string, succeeded: boolean): void {
    const now = Date.now ();
    if (exchange?.markets !== undefined && Object.keys (exchange.markets).length > 0 && !warmMarkets.has (marketsKey (intent))) {
        warmMarkets.set (marketsKey (intent), { 'markets': exchange.markets, 'at': now });
    }
    for (const [ key, entry ] of warmMarkets) if (now - entry.at >= WARM_LIFETIME) warmMarkets.delete (key);
    for (const [ key, entry ] of warmAccount) if (now - entry.at >= WARM_LIFETIME) warmAccount.delete (key);
    // only from a request the exchange accepted: a rejected key says nothing about the account
    if (succeeded && intent.exchange === 'bybit' && warmAccount.size < 2000) {
        const options: Record<string, any> = {};
        for (const flag of ACCOUNT_FLAGS) {
            if (exchange?.options?.[flag] !== undefined) options[flag] = exchange.options[flag];
        }
        if (Object.keys (options).length > 0) warmAccount.set (accountKey (intent, apiKey), { options, 'at': now });
    }
}

// test seam
export function clearWarmState (): void {
    warmMarkets.clear ();
    warmAccount.clear ();
}

function sweep (): void {
    const now = Date.now ();
    for (const [ id, session ] of sessions) {
        if (session.expires <= now) {
            sessions.delete (id);
            // let paused requests finish (they fail on the missing signature) instead of hanging forever
            for (const waiter of session.waiters.splice (0)) waiter.resume ();
        }
    }
}

const symbol = z.string ().regex (/^[A-Za-z0-9][A-Za-z0-9./:_-]{0,63}$/);
const intentSchema = z.object ({
    'action': z.enum ([ 'browser_create_order', 'browser_cancel_order', 'browser_fetch_balance', 'browser_fetch_positions' ]),
    'exchange': z.enum ([ 'binance', 'bybit' ]),
    'network': z.enum ([ 'mainnet', 'testnet' ]),
    'market': z.enum ([ 'spot', 'swap' ]),
    'symbol': symbol.optional (),
    'side': z.enum ([ 'buy', 'sell' ]).optional (),
    'type': z.enum ([ 'limit', 'market' ]).optional (),
    'amount': z.number ().finite ().positive ().optional (),
    'price': z.number ().finite ().positive ().optional (),
    'orderId': z.string ().min (1).max (80).optional (),
}).strict ();

function validateIntent (intent: Intent): string | undefined {
    if (intent.action === 'browser_fetch_positions' && intent.market !== 'swap') return 'Positions need a swap market.';
    if ((intent.action === 'browser_create_order' || intent.action === 'browser_cancel_order') && intent.symbol === undefined) return 'A symbol is required.';
    if (intent.action === 'browser_cancel_order' && intent.orderId === undefined) return 'An order id is required.';
    if (intent.action === 'browser_create_order') {
        if (intent.side === undefined || intent.type === undefined || intent.amount === undefined) return 'Side, type and amount are required.';
        if (intent.type === 'limit' && intent.price === undefined) return 'A limit order requires a price.';
        if (intent.type === 'market' && intent.price !== undefined) return 'Market orders do not take a limit price.';
    }
    return undefined;
}

function buildExchange (deps: SigningDeps, session: Session, apiKey: string): any {
    const { intent } = session;
    const cls = deps.exchangeClass (intent.exchange);
    const binanceSwap = intent.exchange === 'binance' && intent.market === 'swap';
    const exchange = new cls ({
        apiKey, 'secret': PLACEHOLDER_SECRET, 'enableRateLimit': false, 'verbose': false, 'timeout': UPSTREAM_TIMEOUT,
        'options': {
            'defaultType': binanceSwap ? 'future' : intent.market,
            // the signature is made in the browser a round trip later — leave room for it
            'recvWindow': (intent.exchange === 'binance') ? 60000 : 20000,
            'fetchCurrencies': false, 'fetchMargins': false, 'adjustForTimeDifference': false, 'maxRetriesOnFailure': 0,
            'fetchMarkets': { 'types': [ (intent.market === 'swap') ? 'linear' : intent.market ] },
        },
    });
    exchange.has['fetchCurrencies'] = false;
    exchange.log = () => undefined;
    if (intent.network === 'testnet') {
        // binance futures has no testnet any more (ccxt refuses it) — demo trading stands in
        if (binanceSwap) {
            exchange.enableDemoTrading (true);
        } else {
            exchange.setSandboxMode (true);
        }
    }
    // ccxt asks for a signature: hand back a placeholder and remember what has to be signed
    exchange.hmac = (message: Uint8Array | string, _secret: unknown, _hash: unknown, digest = 'hex'): string => {
        if (digest !== 'hex' && digest !== 'base64') {
            throw new Error ('unsupported signature encoding: ' + String (digest));
        }
        // 64 hex characters, like a real HMAC-SHA256 hex digest, so nothing downstream is surprised
        const id = randomBytes (32).toString ('hex');
        const bytes = (typeof message === 'string') ? Buffer.from (message, 'utf8') : Buffer.from (message);
        session.needs.set (id, { id, 'message': bytes.toString ('base64'), 'algorithm': 'HMAC-SHA256', 'encoding': digest });
        return id;
    };
    const fetchUpstream = deps.fetchUpstream ?? (async (url, init) => {
        const response = await fetch (url, { 'method': init.method, 'headers': init.headers, 'body': init.body, 'redirect': 'error', 'signal': AbortSignal.timeout (UPSTREAM_TIMEOUT) });
        return { 'status': response.status, 'text': await response.text () };
    });
    exchange.AbortError = DOMException;
    exchange.FetchError = TypeError;
    exchange.fetchImplementation = async (url: string, init: any): Promise<Response> => {
        const method = String (init?.method ?? 'GET').toUpperCase ();
        let target = String (url);
        let body: string | undefined = (init?.body === undefined || init?.body === null) ? undefined : String (init.body);
        const headers: Record<string, string> = {};
        new Headers (init?.headers ?? {}).forEach ((value, name) => {
            headers[name] = value;
        });
        // which placeholders does this request carry?
        const carried: Need[] = [];
        for (const need of session.needs.values ()) {
            if (target.includes (need.id) || (body !== undefined && body.includes (need.id)) || Object.values (headers).some ((value) => value.includes (need.id))) {
                carried.push (need);
            }
        }
        const missing = carried.filter ((need) => !session.signatures.has (need.id));
        if (missing.length > 0) {
            // pause here until the widget has signed them
            await new Promise<void> ((resolve) => {
                session.waiters.push ({ missing, 'resume': resolve });
                session.notifyPaused?.();
            });
            if (missing.some ((need) => !session.signatures.has (need.id))) {
                throw new TypeError ('the request was not signed in time');
            }
        }
        for (const need of carried) {
            const signature = session.signatures.get (need.id) as string;
            target = target.split (need.id).join (signature);
            if (body !== undefined) body = body.split (need.id).join (signature);
            for (const name of Object.keys (headers)) headers[name] = headers[name].split (need.id).join (signature);
        }
        const parsed = new URL (target);
        const route = method + ' ' + parsed.host + parsed.pathname;
        if (!relayTargetAllowed (intent.exchange, method, target)) {
            deps.report?.({ 'step': 'inline', 'path': SIGN_STEP_TOOL, 'status': 403, 'outcome': 'refused', 'exchange': intent.exchange, 'target': route, 'reason': 'route is not in the allowlist' });
            throw new TypeError ('exchange endpoint is not enabled: ' + route);
        }
        const write = method !== 'GET';
        const sent = Date.now ();
        if (write) session.writeSent = true;
        const upstream = await fetchUpstream (target, { method, headers, body });
        if (write) session.writeAnswered = true;
        deps.report?.({ 'step': 'inline', 'path': SIGN_STEP_TOOL, 'status': 200, 'outcome': 'forwarded', 'exchange': intent.exchange, 'target': route,
            'upstreamStatus': upstream.status, 'upstreamMs': Date.now () - sent, 'bytes': upstream.text.length, 'auth': (carried.length > 0) ? 'signed in the widget' : 'public' });
        return new Response (upstream.text, { 'status': upstream.status, 'headers': { 'Content-Type': 'application/json' } });
    };
    return exchange;
}

function summarize (intent: Intent, result: any): Record<string, any> {
    if (intent.action === 'browser_fetch_balance') {
        const balances: Record<string, { total: any; free: any; used: any }> = {};
        for (const [ asset, total ] of Object.entries (result?.total ?? {})) {
            if (total && Object.keys (balances).length < 60) {
                balances[asset] = { total, 'free': result?.free?.[asset], 'used': result?.used?.[asset] };
            }
        }
        return { 'kind': 'balance', balances };
    }
    if (intent.action === 'browser_fetch_positions') {
        const positions = (Array.isArray (result) ? result : []).slice (0, 60).map ((position: any) => ({
            'symbol': position?.symbol, 'side': position?.side, 'contracts': position?.contracts,
            'entryPrice': position?.entryPrice, 'markPrice': position?.markPrice, 'unrealizedPnl': position?.unrealizedPnl, 'leverage': position?.leverage,
        }));
        return { 'kind': 'positions', positions };
    }
    return {
        'kind': (intent.action === 'browser_cancel_order') ? 'cancel' : 'order',
        'id': result?.id, 'status': result?.status, 'symbol': result?.symbol, 'side': result?.side, 'type': result?.type,
        'amount': result?.amount, 'price': result?.price, 'filled': result?.filled, 'average': result?.average,
    };
}

async function execute (deps: SigningDeps, session: Session, apiKey: string): Promise<StepResult> {
    const { intent } = session;
    let exchange: any;
    let succeeded = false;
    try {
        exchange = buildExchange (deps, session, apiKey);
        warmUp (exchange, intent, apiKey);
        let result: any;
        if (intent.action === 'browser_create_order') {
            result = await exchange.createOrder (intent.symbol, intent.type, intent.side, intent.amount, intent.price);
        } else if (intent.action === 'browser_cancel_order') {
            result = await exchange.cancelOrder (intent.orderId, intent.symbol);
        } else if (intent.action === 'browser_fetch_balance') {
            result = await exchange.fetchBalance ();
        } else {
            result = await exchange.fetchPositions ((intent.symbol !== undefined) ? [ intent.symbol ] : undefined);
        }
        succeeded = true;
        return { 'status': 'done', 'result': summarize (intent, result) };
    } catch (error: any) {
        // an order or cancel that left this server without an answer may or may not have happened
        const uncertain = session.writeSent && !session.writeAnswered;
        return { 'status': 'error', 'error': {
            'title': uncertain ? 'Outcome unknown' : 'Request failed',
            'code': String (error?.constructor?.name ?? 'Error').slice (0, 60),
            'message': uncertain
                ? 'The request was sent but no answer came back. Check the exchange before trying again.'
                : String (error?.message ?? error).slice (0, 600),
            uncertain,
        } };
    } finally {
        sessions.delete (session.id);
        remember (exchange, intent, apiKey, succeeded);
    }
}

// everything the paused requests still need signed, without repeats
function pendingNeeds (session: Session): Need[] {
    const pending = new Map<string, Need> ();
    for (const waiter of session.waiters) {
        for (const need of waiter.missing) {
            if (!session.signatures.has (need.id)) pending.set (need.id, need);
        }
    }
    return [ ...pending.values () ];
}

// waits until the run either pauses for signatures or finishes
async function advance (session: Session): Promise<StepResult> {
    if (pendingNeeds (session).length === 0) {
        const paused = new Promise<void> ((resolve) => {
            session.notifyPaused = resolve;
        });
        const outcome = await Promise.race ([
            (session.run as Promise<StepResult>).then ((result) => ({ 'finished': result })),
            paused.then (() => ({ 'finished': undefined })),
        ]);
        session.notifyPaused = undefined;
        if (outcome.finished !== undefined) {
            return outcome.finished;
        }
        // requests sent in parallel pause one after another — give them a moment to line up, so
        // the widget signs them in one round trip
        await new Promise ((resolve) => setTimeout (resolve, 25));
    }
    return { 'status': 'sign', 'session': session.id, 'need': pendingNeeds (session) };
}

export interface SignStepInput {
    session?: string;
    intent?: unknown;
    apiKey?: string;
    signatures?: { id: string; signature: string }[];
}

// each answer says how long the server spent on it, so the widget can tell server time apart
// from the time spent travelling through the host
export async function signStep (deps: SigningDeps, input: SignStepInput): Promise<StepResult & { serverMs: number }> {
    const started = Date.now ();
    const result = await runStep (deps, input);
    return { ...result, 'serverMs': Date.now () - started };
}

async function runStep (deps: SigningDeps, input: SignStepInput): Promise<StepResult> {
    sweep ();
    const fail = (message: string, code = 'BadRequest'): StepResult => ({ 'status': 'error', 'error': { 'title': 'Request failed', code, message, 'uncertain': false } });
    if (input.session === undefined) {
        const parsed = intentSchema.safeParse (input.intent);
        if (!parsed.success) return fail ('The request details are not valid.');
        const intent = parsed.data as Intent;
        const problem = validateIntent (intent);
        if (problem !== undefined) return fail (problem);
        const apiKey = (input.apiKey ?? '').trim ();
        if (apiKey.length < 8 || apiKey.length > 200 || !/^[\x21-\x7e]+$/.test (apiKey)) return fail ('Enter the API key.');
        if (sessions.size >= MAX_SESSIONS) return fail ('The server is busy. Try again in a moment.', 'Busy');
        const session: Session = {
            'id': randomBytes (18).toString ('base64url'), intent, 'expires': Date.now () + SESSION_LIFETIME,
            'needs': new Map (), 'signatures': new Map (), 'waiters': [], 'notifyPaused': undefined,
            'run': undefined, 'writeSent': false, 'writeAnswered': false,
        };
        sessions.set (session.id, session);
        deps.report?.({ 'step': 'inline', 'path': SIGN_STEP_TOOL, 'status': 200, 'outcome': 'started', 'exchange': intent.exchange,
            'target': [ intent.action, intent.network, intent.market, intent.symbol ].filter (Boolean).join (' ') });
        session.run = execute (deps, session, apiKey);
        return advance (session);
    }
    const session = sessions.get (input.session);
    if (session === undefined || session.waiters.length === 0) {
        return fail ('This signing session has expired. Start the request again.', 'SessionExpired');
    }
    for (const entry of input.signatures ?? []) {
        const need = session.needs.get (entry.id);
        const valid = (need?.encoding === 'hex') ? /^[a-f0-9]{64}$/.test (entry.signature) : /^[A-Za-z0-9+/]{43}=$/.test (entry.signature);
        if (need === undefined || !valid) return fail ('The signature is not valid.');
        session.signatures.set (entry.id, entry.signature);
    }
    // release every paused request that is now fully signed; the rest stay paused
    const ready = session.waiters.filter ((waiter) => waiter.missing.every ((need) => session.signatures.has (need.id)));
    if (ready.length === 0) {
        return fail ('A required signature is missing.');
    }
    session.waiters = session.waiters.filter ((waiter) => !ready.includes (waiter));
    const next = advance (session);
    for (const waiter of ready) waiter.resume ();
    return next;
}

export function registerBrowserSigning (server: McpServer, deps: SigningDeps): void {
    server.registerTool (SIGN_STEP_TOOL, {
        'title': 'Sign in the review widget',
        'description': 'Internal step used by the CCXT review widget to sign a request in the browser. Not for direct use: call browser_create_order, browser_cancel_order, browser_fetch_balance or browser_fetch_positions instead.',
        'inputSchema': {
            'session': z.string ().max (64).optional (),
            'intent': z.record (z.any ()).optional (),
            'apiKey': z.string ().max (200).optional (),
            'signatures': z.array (z.object ({ 'id': z.string ().max (64), 'signature': z.string ().max (128) })).max (8).optional (),
        },
        // callable by the widget, hidden from the model
        // linked to the review widget's resource so hosts that scope a widget's tool calls to "its own" tools include it
        '_meta': { 'ui': { 'resourceUri': browserWidgetUri, 'visibility': [ 'app' ] }, 'openai/outputTemplate': browserWidgetUri, 'openai/widgetAccessible': true, 'openai/visibility': 'private' },
        'annotations': { 'readOnlyHint': false, 'destructiveHint': true, 'openWorldHint': true },
    }, async (input: SignStepInput) => {
        const result = await signStep (deps, input);
        return { 'structuredContent': result, 'content': [ { 'type': 'text' as const, 'text': (result.status === 'sign') ? 'Waiting for the browser signature.' : (result.status === 'done') ? 'Completed in the review widget.' : 'The request failed: ' + result.error.message } ] };
    });
}
