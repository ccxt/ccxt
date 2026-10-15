import { log } from './logging.js';

// Dual-mode ccxt loading, same trick as cli/ts/helpers.ts: a regular import of the
// published package first (also resolves via Node package self-reference inside the
// monorepo once the root js/ build exists), then a Function-eval'd import of the live
// TypeScript sources for contributors running `npm run mcp.ts` with tsx — the eval hides
// the specifier from tsc so it never crawls the monorepo.
let ccxt: any;
try {
    // @ts-ignore
    ccxt = await import ('ccxt');
} catch (e) {
    try {
        // @ts-ignore
        ccxt = await (Function ('return import("../../ts/ccxt")') ());
    } catch (ee) {
        log ('error', 'Neither an installed nor a local ccxt build was found. Run `npm i` (or build the monorepo) first.');
        process.exit (1);
    }
}

// the default export is the canonical shape: exchanges is the id array, pro/prediction
// namespaces carry their own id arrays, exchange classes are properties, plus
// Exchange/BaseError/version — the module namespace differs (exchanges is an id->class map)
if (ccxt.default !== undefined) {
    ccxt = ccxt.default;
}

export { ccxt };

export function ccxtVersion (): string {
    return String (ccxt.version ?? 'unknown');
}

export function predictionExchanges (): string[] {
    return (ccxt.prediction !== undefined) ? (ccxt.prediction.exchanges as string[]) : [];
}

export function allExchangeIds (): string[] {
    const base = ccxt.exchanges as string[];
    const prediction = predictionExchanges ().filter ((id) => !base.includes (id));
    return base.concat (prediction).sort ();
}

export function isKnownExchange (exchangeId: string): boolean {
    return allExchangeIds ().includes (exchangeId);
}

// namespace dispatch, mirroring cli/ts/helpers.ts loadSettingsAndCreateExchange:
// prediction (when requested or prediction-only id) -> pro -> plain
export function exchangeClass (exchangeId: string, prediction = false): any {
    const predictionNamespace = ccxt.prediction;
    const isPrediction = (predictionNamespace !== undefined) && predictionNamespace.exchanges.includes (exchangeId);
    if (isPrediction && (prediction || ccxt[exchangeId] === undefined)) {
        return predictionNamespace[exchangeId];
    }
    if (ccxt.pro !== undefined && ccxt.pro.exchanges.includes (exchangeId)) {
        return ccxt.pro[exchangeId];
    }
    return ccxt[exchangeId];
}

export function closestMatches (needle: string, haystack: string[], count = 5): string[] {
    const lower = needle.toLowerCase ();
    const scored = haystack.map ((candidate) => {
        const candidateLower = candidate.toLowerCase ();
        let score = levenshtein (lower, candidateLower);
        if (candidateLower.includes (lower) || lower.includes (candidateLower)) {
            score = Math.min (score, 1);
        }
        return { candidate, score };
    });
    scored.sort ((a, b) => a.score - b.score);
    return scored.slice (0, count).map ((entry) => entry.candidate);
}

function levenshtein (a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    let previous = Array.from ({ 'length': n + 1 }, (_, i) => i);
    for (let i = 1; i <= m; i++) {
        const current = [ i ];
        for (let j = 1; j <= n; j++) {
            const cost = (a[i - 1] === b[j - 1]) ? 0 : 1;
            current.push (Math.min (previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost));
        }
        previous = current;
    }
    return previous[n];
}
