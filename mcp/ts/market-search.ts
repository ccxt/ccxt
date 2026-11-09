// search_markets row shaping and paging rules, kept out of the tool handler so they can be
// unit-tested without an exchange. Sizes behind the numbers are measured on live okx in
// DESIGN.md ("search_markets sizing").
import { MARKET_FIELDS, jsonStringify } from './format.js';
import { ArgError } from './tools/common.js';

// full MARKET_FIELDS rows are ~450 chars each on okx, so 100 rows ≈ 45k chars (the handler
// applies this cap with clampLimit directly; the constant documents and tests it)
export const SEARCH_MARKETS_MAX_FULL = 100;
// hard ceiling for compact rows (symbol-only rows are ~27 chars, so 1000 ≈ 27k chars)
export const SEARCH_MARKETS_MAX_COMPACT = 1000;
// the rows of a compact page must fit in 55k chars, so the whole response (envelope + meta
// + notice) stays under 60k chars ≈ 20k tokens at a conservative 3 chars/token — below the
// ~25k-token Claude Code tool-result limit
export const SEARCH_MARKETS_BUDGET_CHARS = 55000;

// validate a caller-supplied field list against MARKET_FIELDS; symbol is always kept (first)
// so a compact row still identifies its market. undefined means "full rows".
export function resolveMarketFields (fields: string[] | undefined): string[] | undefined {
    if (fields === undefined) {
        return undefined;
    }
    const unknown = fields.filter ((field) => !MARKET_FIELDS.includes (field));
    if (unknown.length > 0) {
        throw new ArgError (
            'unknown market field' + (unknown.length > 1 ? 's' : '') + ': ' + unknown.map ((field) => JSON.stringify (field)).join (', '),
            'valid fields: ' + MARKET_FIELDS.join (', ') + ' — e.g. fields: ["symbol"] or ["symbol", "contractSize", "limits"]'
        );
    }
    const resolved = [ 'symbol' ];
    for (const field of fields) {
        if (!resolved.includes (field)) {
            resolved.push (field);
        }
    }
    return resolved;
}

// the largest limit a request may apply. Full rows keep the fixed 100 cap. With `fields`,
// the cap is how many of the candidate rows (already projected, starting at the requested
// offset) fit the char budget — never below the full-row cap, and SEARCH_MARKETS_MAX_COMPACT
// when every candidate fits — so compact rows earn a bigger page while heavy fields can't
// overflow the host limit.
export function searchMarketsMaxLimit (candidates: any[], compact: boolean): number {
    if (!compact) {
        return SEARCH_MARKETS_MAX_FULL;
    }
    let used = 2; // the surrounding [ ]
    let fit = 0;
    for (const row of candidates) {
        used += jsonStringify (row).length + 1; // + the separating comma
        if (used > SEARCH_MARKETS_BUDGET_CHARS) {
            return Math.max (SEARCH_MARKETS_MAX_FULL, fit);
        }
        fit++;
    }
    return SEARCH_MARKETS_MAX_COMPACT;
}

// market type -> count over the loaded markets, most common first
export function marketTypeCounts (markets: Record<string, any> | undefined): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const market of Object.values (markets ?? {})) {
        const type = market?.type;
        if (typeof type === 'string') {
            counts[type] = (counts[type] ?? 0) + 1;
        }
    }
    return Object.fromEntries (Object.entries (counts).sort ((a, b) => b[1] - a[1]));
}

const SWAP_ALIASES = [ 'perpetual', 'perpetuals', 'perp', 'perps', 'perpetual_swap', 'perpetual-swap' ];

// explain an empty result so the agent doesn't conclude the exchange lacks the market
export function zeroMatchNotice (exchangeId: string, requestedType: string | undefined, counts: Record<string, number>, activeOnly: boolean): string {
    const types = Object.keys (counts);
    const listed = types.length > 0 ? types.join (', ') : 'none loaded';
    if (requestedType !== undefined && !types.includes (requestedType)) {
        const alias = SWAP_ALIASES.includes (requestedType.toLowerCase ()) ? ' (perpetual contracts are type "swap")' : '';
        return 'no markets of type ' + JSON.stringify (requestedType) + ' on ' + exchangeId + alias + ' — market types here: ' + listed;
    }
    return 'no markets matched these filters on ' + exchangeId + ' — market types here: ' + listed
        + '; check the query/base/quote/settle values (unified currency codes, e.g. "BTC")' + (activeOnly ? ', or pass activeOnly: false to include inactive markets' : '');
}
