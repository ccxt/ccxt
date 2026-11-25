import { createSharedState, type SharedState } from '../../ts/factory.js';
import type { ResolvedConfig } from '../../ts/types.js';
import type { HostedConfig } from './config.js';
import { HostedExchanges, ohlcvTtlMs, ORDERBOOK_TTL_MS, TICKER_TTL_MS } from './guard/exchanges.js';
import { LiveHub } from '../../ts/live/hub.js';
import { currentCallScope, summariseCache } from './scope.js';
import { UpstreamGuard } from './guard/upstream.js';
import { loadViewCatalog } from './views.js';
import type { Telemetry } from './telemetry/index.js';

// Process-wide state of the hosted server, built once. The ccxt-mcp config is built in code
// (never loadConfig ()): no config file, no environment keys, no accounts, no watch_* streams —
// so private access is structurally unreachable, whatever the environment holds. The only
// WebSocket use is the live hub's public market-data streams.

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
    live: LiveHub;
}

// The live hub on the hosted server. Streams come from HostedExchanges (public ccxt.pro
// instances over the warm markets); REST fallback is the guarded instance the tool resolved
// (cache, coalescing, queues, breaker — the hub has no other way to reach an exchange);
// stream opens and stream errors go through the same per-exchange guard.
export function createLiveHub (config: HostedConfig, exchanges: HostedExchanges, guard: UpstreamGuard, telemetry: Telemetry, now?: () => number): LiveHub {
    const { maxConcurrent: _maxConcurrent, streamOpensPerMinute: _opens, ...options } = config.live;
    return new LiveHub ({
        'openStreamInstance': (exchangeId, marketType) => exchanges.streamInstance (exchangeId, marketType),
        'admitStream': (exchangeId) => guard.admitStream (exchangeId),
        'reportStreamError': (exchangeId, error) => guard.reportStreamError (exchangeId, error),
        // a REST fallback answered from the response cache costs the exchange nothing
        'restSource': () => {
            const scope = currentCallScope ();
            const outcome = (scope === undefined) ? undefined : summariseCache (scope.cache);
            return (outcome === 'hit' || outcome === 'coalesced') ? 'cache' : 'rest';
        },
        // never poll REST faster than its cache entry lives: every poll would then be a miss
        'restPollMs': (view, _exchangeId, timeframe, rest) => {
            if (view === 'chart') {
                return ohlcvTtlMs (rest, String (timeframe));
            }
            return (view === 'orderbook') ? ORDERBOOK_TTL_MS : TICKER_TTL_MS;
        },
        'loadFactor': (exchangeId) => guard.pressure (exchangeId),
        'log': (level, message, attributes) => telemetry.log (level, message, attributes),
    }, options, now);
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
        'streamOpensPerMinute': config.live.streamOpensPerMinute,
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
    const live = createLiveHub (config, exchanges, guard, telemetry, overrides.now);
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
        live,
    });
    return { shared, exchanges, guard, live };
}
