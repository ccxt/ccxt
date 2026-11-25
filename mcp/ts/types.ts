import type { AuthInfo } from '@modelcontextprotocol/server';
import type { UiPolicy, ViewCatalog } from './ui.js';
import type { ToolProfile } from './tools/access.js';

export type TierFlag = false | true | 'live';

// the protocol era one McpServer instance serves: 'legacy' = the 2025 initialize handshake,
// 'modern' = the 2026-07-28 per-request envelope. Chosen by the SDK's serving entry per
// connection (stdio) or per request (HTTP); confirmations work differently in each
export type ProtocolEra = 'legacy' | 'modern';

export interface AccountConfig {
    name: string;
    exchange: string;
    prediction?: boolean;
    apiKey?: string;
    secret?: string;
    password?: string;
    uid?: string;
    login?: string;
    token?: string;
    twofa?: string;
    walletAddress?: string;
    privateKey?: string;
    sandbox?: boolean;
    demo?: boolean;
    trading?: TierFlag;
    funds?: TierFlag;
    implicitWrites?: boolean;
    dryRun?: boolean;
    maxOrderValue?: number | null;
    maxTransferValue?: number | null;
    maxDailyValue?: number | null;
    allowedSymbols?: string[];
    deniedSymbols?: string[];
    confirm?: 'always' | 'live' | 'never';
    defaultType?: string;
    options?: Record<string, any>;
    timeout?: number;
    rateLimit?: number;
}

export interface ServerSettings {
    refreshMarketsTimeout: number;
    maxResults: number;
    strictPermissions: boolean;
    exchangeOptions: Record<string, Record<string, any>>;
    maxSubscriptions: number;
    hideDisabledTools: boolean;
    tools?: string; // tool profile: "all", "core" or a comma-separated list of tool names
    loadEnvKeys: boolean;
}

export interface ResolvedConfig {
    accounts: Record<string, AccountConfig>;
    settings: ServerSettings;
    problems: string[];
    configPath: string | undefined;
}

// non-secret projection of an account, safe to return from tools
export interface AccountSummary {
    name: string;
    exchange: string;
    prediction: boolean;
    environment: 'live' | 'sandbox' | 'demo';
    trading: TierFlag;
    funds: TierFlag;
    implicitWrites: boolean;
    dryRun: boolean;
    confirm: string;
    defaultType: string | undefined;
    maxOrderValue: number | null | undefined;
    maxTransferValue: number | null | undefined;
    maxDailyValue: number | null | undefined;
    allowedSymbols: string[] | undefined;
    credentials: string[]; // names of the credential fields that are set — never values
}

export interface ServerContext {
    ccxt: any;
    config: ResolvedConfig;
    pools: any;    // ExchangePools — typed loosely to keep the fake-ccxt test injection trivial
    safety: any;   // Safety
    journal: any;  // Journal
    subscriptions: any; // SubscriptionRegistry (WebSocket streaming)
    router: any;   // ccxt.OrderRouter, or undefined when the installed ccxt predates it
    routes: any;   // RouteCache — routes returned by fetch_route, executable by routeId
    version: string;
    // true on the hosted (public HTTP) server, false on the local stdio server. Shared helpers
    // read it to tighten what leaves the process (error sanitising) — never to grant anything
    hosted: boolean;
    era: ProtocolEra;
    // the verified caller identity: undefined on stdio and in hosted phase 1 (anonymous).
    // Phase 2 resolves accounts from it instead of the local config file; tool handlers read it
    // through requestAuthInfo (), which also sees a per-request ctx.http.authInfo
    authInfo?: AuthInfo;
    // when show_* results carry their view payload, and the views (versioned URIs + HTML)
    ui: { policy: UiPolicy, views: ViewCatalog };
    // which tools this server instance registers (get_safety_status reports it)
    toolProfile: ToolProfile;
    // whether the client declared form elicitation — read per request, because on the
    // 2026-07-28 revision capabilities travel with each request instead of the handshake
    elicitationSupported: () => boolean;
}

export function accountEnvironment (account: AccountConfig): 'live' | 'sandbox' | 'demo' {
    if (account.sandbox) {
        return 'sandbox';
    }
    if (account.demo) {
        return 'demo';
    }
    return 'live';
}

export const CREDENTIAL_FIELDS = [ 'apiKey', 'secret', 'password', 'uid', 'login', 'token', 'twofa', 'walletAddress', 'privateKey' ] as const;

export function accountSummary (account: AccountConfig): AccountSummary {
    return {
        'name': account.name,
        'exchange': account.exchange,
        'prediction': !!account.prediction,
        'environment': accountEnvironment (account),
        'trading': account.trading ?? false,
        'funds': account.funds ?? false,
        'implicitWrites': !!account.implicitWrites,
        'dryRun': !!account.dryRun,
        'confirm': account.confirm ?? 'live',
        'defaultType': account.defaultType,
        'maxOrderValue': account.maxOrderValue,
        'maxTransferValue': account.maxTransferValue,
        'maxDailyValue': account.maxDailyValue,
        'allowedSymbols': account.allowedSymbols,
        'credentials': CREDENTIAL_FIELDS.filter ((field) => (account as any)[field] !== undefined),
    };
}
