import { createSharedState, type SharedState } from '../../ts/factory.js';
import type { ResolvedConfig } from '../../ts/types.js';
import type { HostedConfig } from './config.js';
import { HostedExchanges } from './guard/exchanges.js';
import { UpstreamGuard } from './guard/upstream.js';
import { loadViewCatalog } from './views.js';
import type { Telemetry } from './telemetry/index.js';

// Process-wide state of the hosted server, built once. The ccxt-mcp config is built in code
// (never loadConfig ()): no config file, no environment keys, no accounts, no streams — so
// private access is structurally unreachable, whatever the environment holds.

export function hostedMcpConfig (): ResolvedConfig {
    return {
        'accounts': {},
        'settings': {
            'refreshMarketsTimeout': 0, // markets are refreshed by HostedExchanges, not on demand
            'maxResults': 100,
            'strictPermissions': false,
            'exchangeOptions': {},
            'maxSubscriptions': 0,
            'hideDisabledTools': false,
            'tools': undefined,
            'loadEnvKeys': false,
        },
        'problems': [],
        'configPath': undefined,
    };
}

// a journal that has nothing to record (no writes exist here) and never touches the disk
// (the container's root filesystem is read-only)
export const NULL_JOURNAL: any = Object.freeze ({
    'append': () => {
        throw new Error ('the hosted server has no write tools to journal');
    },
    'unresolvedIntents': () => [],
    'dispatchedValueLast24h': () => 0,
    'location': () => 'none (hosted)',
});

// what list_exchanges / describe_exchange see as "ccxt": the allowlist only, no WebSocket
// namespace (streams are not offered here) and no prediction namespace
export function ccxtFacade (ccxt: any, allowlist: readonly string[]): any {
    return Object.freeze ({
        'version': ccxt.version,
        'exchanges': [ ...allowlist ],
        'pro': { 'exchanges': [] },
        'prediction': undefined,
    });
}

export interface HostedRuntime {
    shared: SharedState;
    exchanges: HostedExchanges;
    guard: UpstreamGuard;
}

export function createRuntime (config: HostedConfig, ccxt: any, telemetry: Telemetry, overrides: { now?: () => number, random?: () => number } = {}): HostedRuntime {
    const guard = new UpstreamGuard ({
        'maxConcurrentPerExchange': config.upstream.maxConcurrentPerExchange,
        'maxQueuedPerExchange': config.upstream.maxQueuedPerExchange,
        'maxUpstreamPerCall': config.upstream.maxUpstreamPerCall,
        'cacheMaxEntries': config.upstream.cacheMaxEntries,
        'breaker': {
            'threshold': config.upstream.breakerThreshold,
            'windowMs': config.upstream.breakerWindowMs,
            'cooldownMs': config.upstream.breakerCooldownMs,
            'maxCooldownMs': config.upstream.breakerMaxCooldownMs,
        },
        'now': overrides.now,
        'onEvent': (event, attributes) => telemetry.log ((event === 'breaker_open') ? 'warn' : 'debug', event, attributes),
    });
    const exchanges = new HostedExchanges ({
        ccxt,
        'exchanges': config.exchanges,
        guard,
        'exchangeTimeoutMs': config.exchangeTimeoutMs,
        'marketsRefreshMs': config.marketsRefreshMs,
        'marketsLoadTimeoutMs': config.marketsLoadTimeoutMs,
        'prewarmConcurrency': config.prewarmConcurrency,
        'log': (level, message, attributes) => telemetry.log (level, message, attributes),
        'now': overrides.now,
        'random': overrides.random,
    });
    const shared = createSharedState ({
        'config': hostedMcpConfig (),
        'ccxtModule': ccxtFacade (ccxt, exchanges.allowlist),
        // unused: the pools are injected; kept total so a missed seam fails loudly
        'poolsDeps': {
            'exchangeClass': () => {
                throw new Error ('hosted: exchange classes come from HostedExchanges');
            },
            'isKnownExchange': (id) => exchanges.allowlist.includes (id),
            'allExchangeIds': () => [ ...exchanges.allowlist ],
            'closestMatches': () => [],
        },
        'version': config.version,
        'pools': exchanges,
        'journal': NULL_JOURNAL,
        'views': loadViewCatalog (),
    });
    return { shared, exchanges, guard };
}
