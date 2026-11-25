import { McpServer } from '@modelcontextprotocol/server';
import type { AuthInfo } from '@modelcontextprotocol/server';
import { ExchangePools, type PoolsDeps } from './pools.js';
import { Safety } from './safety.js';
import { Journal } from './journal.js';
import { SubscriptionRegistry } from './subscriptions.js';
import { registerAllTools, SERVER_INSTRUCTIONS } from './tools/index.js';
import { installRegistrationGuard, type ToolProfile } from './tools/access.js';
import { NamedToolProfile, profileInstructions } from './tools/profile.js';
import { defaultViewCatalog, uiModeFromEnv, requestClientCapabilities, type UiPolicy, type ViewCatalog } from './ui.js';
import { RouteCache, createRouter } from './tools/route.js';
import { currentRequestScope } from './request-scope.js';
import { log } from './logging.js';
import type { ResolvedConfig, ServerContext, ProtocolEra } from './types.js';

export interface SharedStateOptions {
    config: ResolvedConfig;
    ccxtModule: any;
    poolsDeps: PoolsDeps;
    version: string;
    journalDir?: string;
    deadRetentionMs?: number; // how long errored streams stay listable/readable (tests inject a tiny value)
    router?: any; // an OrderRouter instance (tests inject one); defaults to one built from ccxtModule
    views?: ViewCatalog; // the rendered views (tests inject a modified catalog); defaults to ./ui
    // A deployment's own exchange pools and journal. The hosted server passes guarded pools
    // (allowlist, prewarmed memory-only markets, response cache, queues, breakers) and a journal
    // that never touches the disk (its root filesystem is read-only and it has no writes to
    // record). Default: ExchangePools over config + poolsDeps, and the on-disk Journal
    pools?: any;
    journal?: Journal;
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
    pools: ExchangePools; // or the deployment's own pools (SharedStateOptions.pools)
    safety: Safety;
    journal: Journal;
    subscriptions: SubscriptionRegistry;
    router: any;
    routes: RouteCache;
    version: string;
    // the MCP Apps views, rendered and hashed into their versioned URIs once per process
    views: ViewCatalog;
    // the local tool profile (CCXT_MCP_TOOLS / settings.tools), used unless a deployment
    // passes its own to buildServer
    toolProfile: NamedToolProfile;
}

export function createSharedState (options: SharedStateOptions): SharedState {
    const journal = options.journal ?? new Journal (options.journalDir);
    const safety = new Safety (journal);
    const pools = options.pools ?? new ExchangePools (options.config, options.poolsDeps);
    const subscriptions = new SubscriptionRegistry (pools, options.config.settings.maxSubscriptions, options.deadRetentionMs);
    const toolProfile = new NamedToolProfile (options.config.settings.tools);
    // reported once per process, not once per built server
    for (const problem of toolProfile.problems ()) {
        options.config.problems.push (problem);
        log ('warning', 'config: ' + problem);
    }
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
        'views': options.views ?? defaultViewCatalog (),
        toolProfile,
    };
}

export interface BuildServerOptions {
    profile?: ToolProfile;
    authInfo?: AuthInfo;
    hosted?: boolean;
    era?: ProtocolEra; // the SDK serving entry's choice; a bare server.connect () speaks the 2025 handshake
    // when show_* results carry their view payload. mode defaults to CCXT_MCP_UI; whenUnknown
    // to "attach" on the hosted server and "omit" on stdio (see UiWhenUnknown in ./ui.ts)
    ui?: Partial<UiPolicy>;
    // a deployment's own server instructions (the hosted server describes a narrower surface);
    // defaults to SERVER_INSTRUCTIONS, trimmed to the named tool profile
    instructions?: string;
}

// Builds one McpServer over the shared state. Cheap and side-effect free (no I/O, no
// timers, nothing registered outside the new instance), because the SDK serving entries
// call it once per stdio connection plus a discarded server/discover probe, and a hosted
// server calls it once per HTTP request.
export function buildServer (shared: SharedState, options: BuildServerOptions = {}): { server: McpServer, ctx: ServerContext } {
    const hosted = options.hosted === true;
    const profile: ToolProfile = options.profile ?? shared.toolProfile;
    // the instructions are fixed at construction and must not promise a tool the profile
    // hides; a deployment with its own profile brings its own wording
    const instructions = options.instructions ?? ((profile instanceof NamedToolProfile) ? profileInstructions (SERVER_INSTRUCTIONS, profile) : SERVER_INSTRUCTIONS);
    const server = new McpServer ({
        'name': 'ccxt-mcp',
        'version': shared.version,
    }, {
        instructions,
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
        hosted,
        'era': options.era ?? 'legacy',
        'authInfo': options.authInfo,
        'ui': {
            'policy': {
                'mode': options.ui?.mode ?? uiModeFromEnv (),
                'whenUnknown': options.ui?.whenUnknown ?? (hosted ? 'attach' : 'omit'),
            },
            'views': shared.views,
        },
        'toolProfile': profile,
        'elicitationSupported': () => {
            // read per request (see requestClientCapabilities); unknown capabilities — a
            // stateless 2025-era HTTP request — correctly read as "unsupported"
            const capabilities: any = requestClientCapabilities (server, currentRequestScope ()?.request);
            return capabilities?.elicitation !== undefined;
        },
    };
    installRegistrationGuard (server, ctx, profile);
    registerAllTools (server, ctx);
    return { server, ctx };
}

// one shared state and one server: the shape the stdio entry and the in-memory tests use
export function createServer (options: CreateServerOptions): { server: McpServer, ctx: ServerContext } {
    return buildServer (createSharedState (options));
}
