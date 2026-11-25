import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerMarketWidget } from './market-widget.js';
import { ExchangePools, type PoolsDeps } from './pools.js';
import { Safety } from './safety.js';
import { Journal } from './journal.js';
import { SubscriptionRegistry } from './subscriptions.js';
import { registerAllTools, SERVER_INSTRUCTIONS } from './tools/index.js';
import { RouteCache, createRouter } from './tools/route.js';
import type { ResolvedConfig, ServerContext } from './types.js';

export interface CreateServerOptions {
    config: ResolvedConfig;
    browserTradingEnabled?: boolean;
    browserFrameOrigin?: string;
    ccxtModule: any;
    poolsDeps: PoolsDeps;
    version: string;
    journalDir?: string;
    deadRetentionMs?: number; // how long errored streams stay listable/readable (tests inject a tiny value)
    router?: any; // an OrderRouter instance (tests inject one); defaults to one built from ccxtModule
    shared?: SharedState; // reuse long-lived state across servers (the HTTP entry builds one server per request)
    instructions?: string; // overrides the default server instructions (the hosted entry ships its own)
}

// the long-lived pieces: exchange instances (markets cache + per-exchange rate limiter),
// journal, safety state, streams and the router. One per process.
export interface SharedState {
    journal: Journal;
    safety: Safety;
    pools: ExchangePools;
    subscriptions: SubscriptionRegistry;
    router: any;
    routes: RouteCache;
}

export function createSharedState (options: CreateServerOptions): SharedState {
    const journal = new Journal (options.journalDir);
    const safety = new Safety (journal);
    const pools = new ExchangePools (options.config, options.poolsDeps);
    const subscriptions = new SubscriptionRegistry (pools, options.config.settings.maxSubscriptions, options.deadRetentionMs);
    return {
        journal,
        safety,
        pools,
        subscriptions,
        'router': options.router ?? createRouter (options.ccxtModule, options.version),
        'routes': new RouteCache (),
    };
}

// assembles a fully-wired server; server.ts feeds it the real ccxt module and loader deps,
// tests feed it fakes — this factory is the only place the pieces meet
export function createServer (options: CreateServerOptions): { server: McpServer, ctx: ServerContext } {
    const shared = options.shared ?? createSharedState (options);
    const server = new McpServer ({
        'name': 'ccxt-mcp',
        'version': options.version,
    }, {
        'instructions': options.instructions ?? SERVER_INSTRUCTIONS,
    });
    const ctx: ServerContext = {
        'ccxt': options.ccxtModule,
        'config': options.config,
        'pools': shared.pools,
        'safety': shared.safety,
        'journal': shared.journal,
        'subscriptions': shared.subscriptions,
        'router': shared.router,
        'routes': shared.routes,
        'version': options.version,
        'elicitationSupported': () => {
            const capabilities = server.server.getClientCapabilities ();
            return capabilities?.elicitation !== undefined;
        },
        // humans reading a withdrawal preview take longer than the SDK's 60s default —
        // give confirmations 5 minutes and keep resetting while the host reports progress
        'elicit': async (message: string, requestedSchema: any) => server.server.elicitInput (
            { message, requestedSchema },
            { 'timeout': 300000, 'maxTotalTimeout': 300000, 'resetTimeoutOnProgress': true },
        ),
    };
    registerMarketWidget (server, options.browserTradingEnabled, options.browserFrameOrigin);
    registerAllTools (server, ctx);
    return { server, ctx };
}
