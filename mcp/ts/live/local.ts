import { log } from '../logging.js';
import { LiveHub, type LiveBackend, type LiveOptions } from './hub.js';

// The hub on the local stdio server: one user, the pooled public REST instances for fallback
// (ExchangePools.getPublic) and a separate public ccxt.pro instance per (exchange, market type)
// for streams. The watch_* tools keep their own streams (ts/subscriptions.ts) untouched.

// Local defaults: one user, so smaller caps; stats go to stderr rarely
export const LOCAL_LIVE_OPTIONS: Partial<LiveOptions> = Object.freeze ({
    'maxStreams': 100,
    'maxStreamsPerExchange': 50,
    'statsIntervalMs': 300000,
});

export const LIVE_STREAMS_ENV = 'CCXT_MCP_LIVE_STREAMS';

// CCXT_MCP_LIVE_STREAMS=off serves every live poll from REST (no WebSocket at all)
export function localLiveOptions (env: NodeJS.ProcessEnv = process.env): Partial<LiveOptions> {
    const value = String (env[LIVE_STREAMS_ENV] ?? '').trim ().toLowerCase ();
    return { ...LOCAL_LIVE_OPTIONS, 'enabled': !(value === 'off' || value === 'false' || value === '0' || value === 'no') };
}

export function localLiveBackend (pools: any): LiveBackend {
    return {
        'openStreamInstance': (exchangeId, marketType, rest, prediction) => ((typeof pools?.createLiveInstance === 'function') ? pools.createLiveInstance (exchangeId, marketType, rest, prediction) : undefined),
        'log': (level, message, attributes) => {
            // per-stream lines are debug detail; stderr gets the warnings and the stats line
            if (level !== 'debug') {
                log ((level === 'warn') ? 'warning' : level, message, attributes);
            }
        },
    };
}

export function createLocalLiveHub (pools: any, env: NodeJS.ProcessEnv = process.env): LiveHub {
    return new LiveHub (localLiveBackend (pools), localLiveOptions (env));
}
