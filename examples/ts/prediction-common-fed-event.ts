// @NO_AUTO_TRANSPILE
// Find a common FED-related event across every prediction-market exchange,
// then drill down to the same market and the same outcome on each of them.
//
// Each prediction exchange (ccxt.prediction.*) exposes fetchEvents({ query }),
// returning events -> markets (questions) -> outcomes (the tradeable YES/NO shares).
// We search them all for "Fed", then look for a sub-topic that several exchanges
// list (e.g. "chair", "powell", "cut"), and print the matching event / market / outcome.
//
// Usage:
//   npx tsx examples/ts/prediction-common-fed-event.ts

import ccxt from '../../js/ccxt.js';

const STOP_WORDS = [
    'will', 'the', 'a', 'an', 'in', 'on', 'of', 'to', 'be', 'by', 'at', 'or', 'and',
    'for', 'is', 'are', 'who', 'what', 'when', 'next', 'before', 'after', 'this', 'that',
    '2024', '2025', '2026', '2027',
];

function tokenize (title: string): string[] {
    const lowered = (title || '').toLowerCase ().replace (/[^a-z0-9 ]/g, ' ');
    return lowered.split (' ').filter ((w) => w.length > 2 && STOP_WORDS.indexOf (w) === -1);
}

// pick the most "affirmative" outcome so we compare the same side across exchanges
function pickOutcome (outcomes: any[]): any {
    if (!outcomes || outcomes.length === 0) {
        return undefined;
    }
    const preferred = [ 'yes', 'up', 'above', 'over' ];
    for (const out of outcomes) {
        const label = ((out.label as string) || '').toLowerCase ();
        if (preferred.indexOf (label) !== -1) {
            return out;
        }
    }
    return outcomes[0];
}

async function main () {
    const ids = [ 'polymarket', 'kalshi', 'limitless', 'myriad', 'hyperliquid' ];
    const query = 'Fed';
    const eventsByExchange: Record<string, any[]> = {};

    // 1) instantiate every prediction exchange and search it for FED events
    for (const id of ids) {
        const exchange = new (ccxt.prediction as any)[id] ();
        try {
            const events = await exchange.fetchEvents ({ 'query': query });
            eventsByExchange[id] = events;
            console.log (id.padEnd (12), '→', events.length, 'FED events');
        } catch (e) {
            eventsByExchange[id] = [];
            console.log (id.padEnd (12), '→ skipped:', (e as Error).constructor.name);
        }
    }

    // 2) index normalized title tokens -> which exchanges have an event with that token
    const tokenToExchanges: Record<string, Set<string>> = {};
    for (const id of ids) {
        const seen = new Set<string> ();
        for (const ev of eventsByExchange[id] || []) {
            for (const tok of tokenize (ev.title)) {
                if (seen.has (tok)) {
                    continue; // count each token once per exchange
                }
                seen.add (tok);
                if (!(tok in tokenToExchanges)) {
                    tokenToExchanges[tok] = new Set<string> ();
                }
                tokenToExchanges[tok].add (id);
            }
        }
    }

    // 3) the FED sub-topic shared by the most exchanges = our "common event"
    let bestToken: string | undefined = undefined;
    let bestCount = 1;
    for (const tok of Object.keys (tokenToExchanges)) {
        if (tok === 'fed' || tok === 'federal' || tok === 'reserve') {
            continue; // too generic — everything matched these
        }
        const count = tokenToExchanges[tok].size;
        if (count > bestCount) {
            bestCount = count;
            bestToken = tok;
        }
    }

    if (bestToken === undefined) {
        console.log ('\nNo FED sub-topic was found on more than one exchange right now.');
        return;
    }

    console.log ('\nCommon FED topic:', bestToken, '— listed on', bestCount, 'exchanges\n');

    // 4) for each exchange that has it, show the event -> market -> outcome
    for (const id of ids) {
        const match = (eventsByExchange[id] || []).find ((ev) => tokenize (ev.title).indexOf (bestToken as string) !== -1);
        if (match === undefined) {
            continue;
        }
        const market = (match.markets && match.markets.length > 0) ? match.markets[0] : undefined;
        const outcome = market ? pickOutcome (market.outcomes) : undefined;
        console.log ('•', id);
        console.log ('    event:  ', match.title);
        console.log ('    market: ', market ? market.symbol : 'n/a');
        console.log ('    outcome:', outcome ? outcome.label : 'n/a', outcome ? outcome.outcome : '');
    }
}

main ();
