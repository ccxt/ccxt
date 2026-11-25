import type { McpServer } from '@modelcontextprotocol/server';
import type { ServerContext } from '../types.js';
import { toContent } from '../format.js';
import { runInRequestScope } from '../request-scope.js';
import { isRegisteredSecret } from '../redact.js';

// What a tool does with respect to accounts and the outside world. Deployments choose
// their tool surface by access class (the hosted server's profile filters on it), so the
// class of a tool must describe its most sensitive capability:
// - public:   anonymous public market data and exchange metadata; no account involved
// - account:  reads a configured account's private data (balances, orders, positions, fills)
// - write:    changes account state on an exchange (orders, leverage, margin mode)
// - funds:    moves funds or reveals deposit addresses
// - stream:   long-lived WebSocket subscriptions held in server memory
// - executor: generic dispatch by method or endpoint name (and the discovery that feeds it);
//             its reach is the whole ccxt surface, so it is never part of a curated profile
// - routing:  quotes and executes multi-venue routes through the CCXT order router
// - meta:     reports this server's own local configuration
export type AccessClass = 'public' | 'account' | 'write' | 'funds' | 'stream' | 'executor' | 'routing' | 'meta';

// One row per registered tool. A test fails when a registered tool is missing here or a
// row names a tool that no longer exists, and registration itself refuses an unclassified
// tool — so a new tool cannot reach any deployment without a deliberate classification.
export const TOOL_ACCESS: Readonly<Record<string, AccessClass>> = Object.freeze ({
    'list_exchanges': 'public',
    'describe_exchange': 'public',
    'search_markets': 'public',
    'get_tickers': 'public',
    'get_orderbook': 'public',
    'get_ohlcv': 'public',
    'get_trades': 'public',
    'search_events': 'public',
    'show_chart': 'public',
    'show_orderbook': 'public',
    'show_tickers': 'public',
    'get_balance': 'account',
    'get_orders': 'account',
    'get_my_trades': 'account',
    'get_positions': 'account',
    'create_order': 'write',
    'edit_order': 'write',
    'cancel_order': 'write',
    'cancel_all_orders': 'write',
    'set_leverage': 'write',
    'set_margin_mode': 'write',
    'withdraw': 'funds',
    'transfer': 'funds',
    'get_deposit_address': 'funds',
    'watch_subscribe': 'stream',
    'watch_read': 'stream',
    'watch_unsubscribe': 'stream',
    'watch_list': 'stream',
    'describe_method': 'executor',
    'call_read_method': 'executor',
    'call_implicit_get': 'executor',
    'call_write_method': 'executor',
    'call_implicit_write': 'executor',
    'fetch_route': 'routing',
    'execute_route': 'routing',
    'list_accounts': 'meta',
    'get_safety_status': 'meta',
});

export function accessClassOf (tool: string): AccessClass | undefined {
    return Object.prototype.hasOwnProperty.call (TOOL_ACCESS, tool) ? TOOL_ACCESS[tool] : undefined;
}

// Which tools one server instance registers. The default profile registers everything the
// tier logic in registerAllTools asks for (today's stdio behaviour); a deployment narrows
// it by access class or by name (tools/profile.ts) — the filter runs at registration, so a
// filtered tool does not exist on that server at all (it is never listed and cannot be called)
export interface ToolProfile {
    name: string;
    allows: (tool: string, access: AccessClass) => boolean;
    // optional last word on an allowed tool's definition, e.g. dropping a description's
    // pointer to a tool this profile hides. Must return a config of the same shape
    adjust?: (tool: string, config: any) => any;
    // what get_safety_status reports about the profile (defaults to name + no hidden tools)
    status?: () => Record<string, any>;
    // optional replacement handler for an allowed tool: the tool keeps its name, annotations
    // and input schema (so the tool list does not change) but this runs instead of the real
    // handler. The hosted server answers account tools this way until sign-in exists. The
    // credential check and the request scope still wrap the replacement
    replace?: (tool: string, access: AccessClass) => ((args: any, request: any) => any) | undefined;
}

export const FULL_PROFILE: ToolProfile = Object.freeze ({
    'name': 'full',
    'allows': () => true,
});

// Keys whose value is a secret. A user who pastes a key into "params" would otherwise have
// it forwarded to the exchange verbatim (as a query parameter on GET endpoints) and echoed
// into the transcript, logs and analytics. Matched on the normalised key (lower case,
// without "_" and "-"). Addresses are deliberately absent: walletAddress / user / address
// are public identifiers that keyless venues (hyperliquid, prediction markets) need for
// legitimate reads.
const CREDENTIAL_KEYS = new Set ([
    'apikey', 'apisecret', 'secret', 'secretkey', 'passphrase', 'privatekey',
    'twofa', 'accesstoken', 'refreshtoken', 'mnemonic', 'seedphrase',
]);
// ccxt credential field names that are also ordinary request and path parameters on real
// endpoints (gemini v1/network/{token}, woo token_interest/{token}, krakenfutures
// subaccount/{uid}/trading-enabled, "token" as a currency id in several request bodies).
// The anonymous hosted server never takes credentials, so there they are refused outright.
// On a local server they are forwarded as before, unless the value is one of the user's
// own configured credentials. "token" with an EVM address value is public data (the
// collateral/outcome token contract on prediction venues) everywhere.
const AMBIGUOUS_KEYS = new Set ([ 'token', 'uid', 'password' ]);
const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const MAX_SCAN_DEPTH = 32;

function normaliseKey (key: string): string {
    return key.toLowerCase ().replace (/[_-]/g, '');
}

// returns the path of the first credential-looking key, e.g. "params.apiKey", never the
// value. strict (the hosted server) also refuses the ambiguous names whatever their value
export function findCredentialKey (value: any, strict = true, path = '', depth = 0): string | undefined {
    if (value === null || typeof value !== 'object' || depth > MAX_SCAN_DEPTH) {
        return undefined;
    }
    if (Array.isArray (value)) {
        for (let i = 0; i < value.length; i++) {
            const found = findCredentialKey (value[i], strict, path + '[' + i + ']', depth + 1);
            if (found !== undefined) {
                return found;
            }
        }
        return undefined;
    }
    for (const [ key, entry ] of Object.entries (value)) {
        const keyPath = (path === '') ? key : path + '.' + key;
        const normalised = normaliseKey (key);
        if (CREDENTIAL_KEYS.has (normalised)) {
            return keyPath;
        }
        if (AMBIGUOUS_KEYS.has (normalised)) {
            const address = normalised === 'token' && typeof entry === 'string' && EVM_ADDRESS.test (entry);
            if (!address && (strict || isRegisteredSecret (entry))) {
                return keyPath;
            }
        }
        const found = findCredentialKey (entry, strict, keyPath, depth + 1);
        if (found !== undefined) {
            return found;
        }
    }
    return undefined;
}

function credentialRejection (keyPath: string, hosted: boolean) {
    return toContent ({
        'ok': false,
        'error': {
            'code': 'BAD_REQUEST',
            'message': 'refused "' + keyPath + '": credential-like keys are never accepted in tool arguments — they would be sent to the exchange and echoed back into the conversation. The call was not made.',
            'retryable': false,
            'hint': hosted
                ? 'this server only serves public market data and never takes exchange credentials — do not paste keys into the chat'
                : 'API credentials belong only in the local ccxt-mcp config file (get_safety_status shows its path), never in the conversation; remove the key from the arguments and ask the user to rotate it if it was real',
        },
    });
}

// Installs the registration choke point on one server instance, before any tool is
// registered. Every registerTool call then:
// - must name a classified tool and declare an inputSchema (fails loudly at startup otherwise),
// - is skipped when the profile does not allow the tool's access class,
// - gets a handler that rejects credential-looking keys anywhere in its arguments and runs
//   the real handler inside the request scope (SDK request context, hosted flag, authInfo).
export function installRegistrationGuard (server: McpServer, ctx: ServerContext, profile: ToolProfile): void {
    const register = server.registerTool.bind (server) as (...args: any[]) => any;
    (server as any).registerTool = (name: string, config: any, handler: (args: any, request: any) => any) => {
        const access = accessClassOf (name);
        if (access === undefined) {
            throw new Error ('tool ' + name + ' has no access class — add it to TOOL_ACCESS in tools/access.ts');
        }
        if (config?.inputSchema === undefined) {
            // without an inputSchema the SDK passes the request context as the FIRST argument,
            // which this wrapper would misread as tool arguments
            throw new Error ('tool ' + name + ' must declare an inputSchema (z.object ({}) when it takes none)');
        }
        if (!profile.allows (name, access)) {
            return undefined;
        }
        if (profile.adjust !== undefined) {
            config = profile.adjust (name, config);
        }
        const inner = profile.replace?.(name, access) ?? handler;
        const guarded = async (args: any, request: any) => {
            const keyPath = findCredentialKey (args, ctx.hosted);
            if (keyPath !== undefined) {
                return credentialRejection (keyPath, ctx.hosted);
            }
            const scope = {
                request,
                'hosted': ctx.hosted,
                'authInfo': request?.http?.authInfo ?? ctx.authInfo,
            };
            return runInRequestScope (scope, () => inner (args, request));
        };
        return register (name, config, guarded);
    };
}
