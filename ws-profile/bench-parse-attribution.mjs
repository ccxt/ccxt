// Micro-attribution of ccxt's per-message parse layer (Client.onMessage):
// plain JSON.parse vs the big-int-guard regex replace + JSON.parse that
// ts/src/base/ws/Client.ts applies to every JSON text frame.
// Usage: node bench-parse-attribution.mjs
import { makePayload } from './common.mjs';

function time (fn, n) {
    const t0 = process.hrtime.bigint ();
    for (let i = 0; i < n; i++) fn ();
    return Number (process.hrtime.bigint () - t0) / 1e3 / n; // µs/op
}

const BIGINT_GUARD = /:(\d{15,}),/g;

// "partial parse" ceiling: extract only the routing field ("e") without
// parsing — what a lazy-parse Client could theoretically save IF the consumer
// never touched the rest of the message (ccxt handlers do touch it, so full
// parse is unavoidable in practice; this quantifies the theoretical bound)
function peekTopic (s) {
    const i = s.indexOf ('"e":"');
    if (i === -1) return undefined;
    const j = s.indexOf ('"', i + 5);
    return s.slice (i + 5, j);
}

function main () {
    const N = 20000;
    const results = {};
    for (const kind of [ 'json1k', 'json20k' ]) {
        const s = makePayload (kind).data;
        // warmup
        time (() => JSON.parse (s), 2000);
        time (() => JSON.parse (s.replace (BIGINT_GUARD, ':"$1",')), 2000);
        time (() => peekTopic (s), 2000);
        results[kind] = {
            json_parse_us_per_msg: Math.round (time (() => JSON.parse (s), N) * 100) / 100,
            regex_plus_json_parse_us_per_msg: Math.round (time (() => JSON.parse (s.replace (BIGINT_GUARD, ':"$1",')), N) * 100) / 100,
            topic_peek_only_us_per_msg: Math.round (time (() => peekTopic (s), N) * 1000) / 1000,
        };
    }
    console.log ('RESULT ' + JSON.stringify (results, null, 2));
}

main ();
