import { accessClassOf, type AccessClass, type ToolProfile } from '../../ts/tools/access.js';
import { z } from 'zod';
import { toContent } from '../../ts/format.js';

// The hosted tool surface: an explicit list, so a tool added to the local server never
// appears on the public endpoint by accident (test/profile.test.ts pins it against the
// table in DESIGN.md). Each listed tool must still carry the access class this list
// assumes: if a tool's class ever changes to something more sensitive, the server refuses
// to start instead of exposing it.
export const HOSTED_TOOLS: Readonly<Record<string, AccessClass>> = Object.freeze ({
    // market data, from the exchange allowlist
    'list_exchanges': 'public',
    'describe_exchange': 'public',
    'search_markets': 'public',
    'get_tickers': 'public',
    'get_orderbook': 'public',
    'get_ohlcv': 'public',
    'get_trades': 'public',
    // the same data with an MCP Apps view
    'show_chart': 'public',
    'show_orderbook': 'public',
    'show_tickers': 'public',
    // the views' app-only refresh: polled by a view on screen, hidden from the model where the
    // host supports it, answered by the shared market-data hub (DESIGN.md, "Live views")
    'live_update': 'public',
    // listed so the model can answer "what is my balance?" with the way to get it; they
    // return ACCOUNT_REQUIRED and never reach an exchange. Phase 2 gates the same tools by
    // sign-in instead, so the tool list does not change when accounts arrive
    'get_balance': 'account',
    'get_orders': 'account',
    'get_positions': 'account',
    'get_my_trades': 'account',
});

export const LOCAL_SERVER_DOCS = 'https://docs.ccxt.com/docs/mcp';

// Arguments no hosted tool takes:
// - params: free-form exchange parameters. On a shared public server they are an unbounded
//   surface (forwarded verbatim to exchange URLs from the server's IP addresses), and both
//   directories reject pass-through executors. The key is removed from every hosted schema
//   and the schemas are strict, so a model that sends it gets a validation error naming the
//   key instead of having it silently ignored.
// - reload: callers never force a markets reload; the server refreshes markets itself.
// - prediction: prediction-market venues are not on the hosted allowlist (see README).
export const HOSTED_REMOVED_ARGUMENTS = [ 'params', 'reload', 'prediction' ] as const;

// Wording of the local server's tool definitions that would point a hosted model at
// something that does not exist here. Each [from, to] must match exactly once: a reworded
// local description makes registration throw (and the tests fail) rather than leaving a
// stale pointer on the public endpoint.
const DESCRIPTION_EDITS: Readonly<Record<string, readonly (readonly [ string, string ])[]>> = Object.freeze ({
    'list_exchanges': [
        [ 'List every exchange this server supports (built from ccxt.exchanges at runtime), with name, websocket and prediction-market availability.', 'List the exchanges this hosted server serves (a curated subset of ccxt; every ccxt exchange is available through the local CCXT MCP server).' ],
    ],
    'describe_exchange': [
        [ ' Per-method detail lives in describe_method.', '' ],
    ],
    'search_markets': [
        [ ' On prediction exchanges use search_events instead.', '' ],
    ],
    'get_tickers': [
        [ ' (outcome handles on prediction exchanges)', '' ],
    ],
    'get_ohlcv': [
        [ '; "params.until" bounds the end.', '.' ],
    ],
    'get_positions': [
        [ ' (prediction-market positions on prediction exchanges)', '' ],
    ],
});

const ACCOUNT_PREFIX = 'Not available on this hosted server (public market data only): returns ACCOUNT_REQUIRED with how the user gets account access through the local CCXT MCP server. ';
const ACCOUNT_ARGUMENT = 'account name — accounts need the local CCXT MCP server; credentials are never parameters';

function editDescription (tool: string, description: string): string {
    let text = description;
    for (const [ from, to ] of DESCRIPTION_EDITS[tool] ?? []) {
        const at = text.indexOf (from);
        if (at === -1 || text.indexOf (from, at + 1) !== -1) {
            throw new Error ('hosted profile: the description of ' + tool + ' no longer contains ' + JSON.stringify (from) + ' exactly once — update DESCRIPTION_EDITS in mcp/hosted/src/profile.ts');
        }
        text = text.slice (0, at) + to + text.slice (at + from.length);
    }
    return text;
}

export function accountRequiredResult (tool: string) {
    return toContent ({
        'ok': false,
        'error': {
            'code': 'ACCOUNT_REQUIRED',
            'message': tool + ' needs an exchange account, and this hosted server has none: it serves public market data only (prices, order books, candles, trades). No exchange was called.',
            'retryable': false,
            'hint': 'tell the user that balances, orders, positions and their own trades need the local CCXT MCP server, which keeps API keys on their own machine: ' + LOCAL_SERVER_DOCS + ' — never ask for API keys in the chat',
            'docs': LOCAL_SERVER_DOCS,
        },
    });
}

export const NOAUTH = Object.freeze ([ Object.freeze ({ 'type': 'noauth' }) ]);

// what a strict public schema accepts as `context` when the PostHog SDK does not inject it
const CONTEXT_ARGUMENT = 'optional: a few words on why this tool is being called';

export class HostedToolProfile implements ToolProfile {
    'name' = 'hosted';
    // With analytics on, @posthog/mcp injects a required `context` argument into every tool
    // (and strips it before the handler). With analytics off nothing does, and the strict
    // schemas rejected it — so a host holding a tools/list cached from an instance with
    // analytics on failed every call on one without. When the SDK will not inject it, the
    // profile accepts it as optional; when it will, the profile leaves it to the SDK, which
    // only injects (and records) an argument the schema does not already have.
    private acceptContext: () => boolean;

    constructor (acceptContext: () => boolean = () => true) {
        this.acceptContext = acceptContext;
        for (const [ tool, expected ] of Object.entries (HOSTED_TOOLS)) {
            const actual = accessClassOf (tool);
            if (actual !== expected) {
                throw new Error ('hosted profile: ' + tool + ' is classified ' + String (actual) + ' but the hosted list expects ' + expected + ' — review tools/access.ts before exposing it publicly');
            }
        }
    }

    allows (tool: string, access: AccessClass): boolean {
        return HOSTED_TOOLS[tool] === access;
    }

    adjust (tool: string, config: any): any {
        const schema = config.inputSchema;
        const shape = schema.shape as Record<string, any>;
        const removed: Record<string, true> = {};
        for (const key of HOSTED_REMOVED_ARGUMENTS) {
            if (key in shape) {
                removed[key] = true;
            }
        }
        let inputSchema = schema.omit (removed);
        if (HOSTED_TOOLS[tool] === 'account') {
            // the stub ignores its arguments: any call, {} or {"exchange": ...} included, must
            // reach ACCOUNT_REQUIRED and its hint, not a schema error about an "account name"
            // a hosted user cannot have
            if ('account' in shape) {
                inputSchema = inputSchema.extend ({ 'account': shape['account'].describe (ACCOUNT_ARGUMENT) });
            }
            inputSchema = inputSchema.partial ().loose ();
        } else {
            // live_update is called by views, which never send `context`: it always declares
            // it optional, so the analytics SDK (which skips tools that have one) never makes
            // it required there
            if ((this.acceptContext () || tool === 'live_update') && !('context' in shape)) {
                inputSchema = inputSchema.extend ({ 'context': z.string ().max (1000).optional ().describe (CONTEXT_ARGUMENT) });
            }
            // unknown keys (a "params" a model remembers from the local server, a typo) are a
            // validation error naming the key, not silently dropped
            inputSchema = inputSchema.strict ();
        }
        let description = editDescription (tool, String (config.description ?? ''));
        if (HOSTED_TOOLS[tool] === 'account') {
            description = ACCOUNT_PREFIX + description;
        }
        // OpenAI reads per-tool auth from securitySchemes; the SDK lists only _meta of the
        // extra keys, which OpenAI documents as the mirror it reads too. Phase 1 is anonymous
        // for every tool (account stubs answer ACCOUNT_REQUIRED); phase 2 gives account tools
        // oauth2 here without changing which tools exist
        const meta = { ...(config._meta ?? {}), 'securitySchemes': [ ...NOAUTH ] };
        // the account stubs reach nothing outside this server until sign-in exists (they
        // answer ACCOUNT_REQUIRED from here), so they are not open-world on the hosted
        // server; listing/ANNOTATIONS.md states each value's justification for the directory
        const annotations = (HOSTED_TOOLS[tool] === 'account') ? { ...(config.annotations ?? {}), 'openWorldHint': false } : config.annotations;
        return { ...config, inputSchema, description, annotations, '_meta': meta };
    }

    replace (tool: string, access: AccessClass): ((args: any, request: any) => any) | undefined {
        if (access !== 'account') {
            return undefined;
        }
        return async () => accountRequiredResult (tool);
    }

    status (): Record<string, any> {
        return { 'profile': 'hosted', 'tools': Object.keys (HOSTED_TOOLS) };
    }
}

// The opening paragraph is what ChatGPT and Codex weigh most ("the first 512 characters"),
// so it stands on its own: what this is, how to start, the views, and where account access
// lives. test/profile.test.ts pins it under 512 characters.
export const HOSTED_INSTRUCTIONS = `CCXT market data (hosted, read-only): public prices, order books, candles and trades from major cryptocurrency exchanges via the ccxt library. Resolve exchange ids with list_exchanges and symbols with search_markets (never guess), then read with get_tickers, get_orderbook, get_ohlcv or get_trades. To SHOW prices, call show_chart, show_orderbook or show_tickers. Balances, orders, positions and trading need the local CCXT MCP server: ${LOCAL_SERVER_DOCS}

Conventions:
- Symbols are unified ccxt symbols ("BTC/USDT" spot, "BTC/USDT:USDT" swap) — resolve them with search_markets (fields: ["symbol"] lists many compactly). marketType selects the market family on exchanges with several.
- "since" accepts ms timestamps or ISO8601 strings; results carry both timestamp and datetime. Results are capped (meta.count, meta.hasMore) — page with since/offset.
- show_* tools render an interactive view and return a compact summary. meta.ui says what happened: "displayed" — the user sees the view, so comment on it instead of repeating numbers; "attached" — a view was sent but the host did not say whether it renders views, so also state the key figures; "unsupported", "unknown" or "off" — nothing was shown, present the summary in text.
- This server is shared by everyone who uses it: data is briefly cached (order books 1 s, tickers and trades 2 s, candles up to 60 s), and an error with code RATE_LIMITED or EXCHANGE_UNAVAILABLE carries retryAfterSeconds — wait that long before retrying, do not loop.
- get_balance, get_orders, get_positions and get_my_trades return ACCOUNT_REQUIRED here: relay its hint (install the local server; API keys stay on the user's machine). Never ask the user for API keys or secrets.`;
