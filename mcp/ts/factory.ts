import { McpServer, CLIENT_CAPABILITIES_META_KEY } from '@modelcontextprotocol/server';
import type { AuthInfo } from '@modelcontextprotocol/server';
import { ExchangePools, type PoolsDeps } from './pools.js';
import { Safety } from './safety.js';
import { Journal } from './journal.js';
import { SubscriptionRegistry } from './subscriptions.js';
import { registerAllTools, SERVER_INSTRUCTIONS } from './tools/index.js';
import { installRegistrationGuard, FULL_PROFILE, type ToolProfile } from './tools/access.js';
import { RouteCache, createRouter } from './tools/route.js';
import { currentRequestScope } from './request-scope.js';
import type { ResolvedConfig, ServerContext, ProtocolEra } from './types.js';

export interface SharedStateOptions {
    config: ResolvedConfig;
    ccxtModule: any;
    poolsDeps: PoolsDeps;
    version: string;
    journalDir?: string;
    deadRetentionMs?: number; // how long errored streams stay listable/readable (tests inject a tiny value)
    router?: any; // an OrderRouter instance (tests inject one); defaults to one built from ccxtModule
}

// kept as the name callers and tests already use for createServer's options
export type CreateServerOptions = SharedStateOptions;

// Everything that is expensive, stateful or must be unique per process: exchange instances
// and their markets, rate-limit throttlers, the write journal, confirm tokens and account
// locks, live streams, the order router and its route cache. Built ONCE per process and
// shared by every McpServer instance — one on stdio, one per request on a hosted server.
export interface SharedState {
    ccxt: any;
    config: ResolvedConfig;
    pools: ExchangePools;
    safety: Safety;
    journal: Journal;
    subscriptions: SubscriptionRegistry;
    router: any;
    routes: RouteCache;
    version: string;
}

export function createSharedState (options: SharedStateOptions): SharedState {
    const journal = new Journal (options.journalDir);
    const safety = new Safety (journal);
    const pools = new ExchangePools (options.config, options.poolsDeps);
    const subscriptions = new SubscriptionRegistry (pools, options.config.settings.maxSubscriptions, options.deadRetentionMs);
    return {
        'ccxt': options.ccxtModule,
        'config': options.config,
        pools,
        safety,
        journal,
        subscriptions,
        'router': options.router ?? createRouter (options.ccxtModule, options.version),
        'routes': new RouteCache (),
        'version': options.version,
    };
}

export interface BuildServerOptions {
    profile?: ToolProfile;
    authInfo?: AuthInfo;
    hosted?: boolean;
    era?: ProtocolEra; // the SDK serving entry's choice; a bare server.connect () speaks the 2025 handshake
}

// Builds one McpServer over the shared state. Cheap and side-effect free (no I/O, no
// timers, nothing registered outside the new instance), because the SDK serving entries
// call it once per stdio connection plus a discarded server/discover probe, and a hosted
// server calls it once per HTTP request.
export function buildServer (shared: SharedState, options: BuildServerOptions = {}): { server: McpServer, ctx: ServerContext } {
    const server = new McpServer ({
        'name': 'ccxt-mcp',
        'version': shared.version,
    }, {
        'instructions': SERVER_INSTRUCTIONS,
    });
    const ctx: ServerContext = {
        'ccxt': shared.ccxt,
        'config': shared.config,
        'pools': shared.pools,
        'safety': shared.safety,
        'journal': shared.journal,
        'subscriptions': shared.subscriptions,
        'router': shared.router,
        'routes': shared.routes,
        'version': shared.version,
        'hosted': options.hosted === true,
        'era': options.era ?? 'legacy',
        'authInfo': options.authInfo,
        'elicitationSupported': () => {
            // 2026-07-28 requests carry the client's capabilities in their own envelope; a
            // 2025-era connection declared them once in initialize. A stateless 2025-era
            // HTTP request has neither, which correctly reads as "unsupported"
            const envelope: any = currentRequestScope ()?.request?.mcpReq?.envelope;
            const capabilities: any = envelope?.[CLIENT_CAPABILITIES_META_KEY] ?? server.server.getClientCapabilities ();
            return capabilities?.elicitation !== undefined;
        },
    };
    installRegistrationGuard (server, ctx, options.profile ?? FULL_PROFILE);
    registerAllTools (server, ctx);
    return { server, ctx };
}

// one shared state and one server: the shape the stdio entry and the in-memory tests use
export function createServer (options: CreateServerOptions): { server: McpServer, ctx: ServerContext } {
    return buildServer (createSharedState (options));
}
