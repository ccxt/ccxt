// @NO_AUTO_TRANSPILE
// fetchEvents options on prediction-market exchanges
//
// Prediction exchanges (ccxt.prediction.*) accept a typed `fetchEventsParams` object:
//   query     keyword search
//   limit     max number of events to return
//   sort      'volume' (default) | 'liquidity' | 'newest'
//   status    'active' (default) | 'inactive' | 'closed' | 'all'  ('inactive'/'closed' interchangeable)
//   searchIn  'title' (default) | 'description' | 'both'  (refines a keyword search)
//   eventId   direct lookup by event id
//   slug      direct lookup by event slug
//
// Where the exchange API supports a param it is pushed server-side (polymarket maps
// sort -> order, status -> active/closed, eventId/slug -> the events endpoint); otherwise
// it is applied client-side, so every exchange supports the same options uniformly.
//
// Usage:
//   npx tsx examples/ts/prediction-fetch-events-options.ts

import ccxt from '../../js/ccxt.js';

function summarize (events: any[], n = 3): string {
    const titles = [];
    for (let i = 0; i < Math.min (n, events.length); i++) {
        titles.push ((events[i].title || events[i].event || '').slice (0, 40));
    }
    return events.length + ' events  [' + titles.join (' | ') + ']';
}

async function main () {
    const exchange = new ccxt.prediction.polymarket ();

    const cases: Array<[string, any]> = [
        [ 'default (top by volume)', {} ],
        [ 'limit: 3', { limit: 3 } ],
        [ 'sort: newest, limit 3', { sort: 'newest', limit: 3 } ],
        [ 'sort: liquidity, limit 3', { sort: 'liquidity', limit: 3 } ],
        [ 'status: closed, limit 3', { status: 'closed', limit: 3 } ],
        [ 'query: Fed', { query: 'Fed' } ],
        [ 'query: Fed, searchIn title', { query: 'Fed', searchIn: 'title' } ],
        [ 'query: Fed, searchIn description', { query: 'Fed', searchIn: 'description' } ],
    ];

    for (const [ label, params ] of cases) {
        try {
            const events = await exchange.fetchEvents (params);
            console.log (label.padEnd (36), '->', summarize (events));
        } catch (e) {
            console.log (label.padEnd (36), '-> error:', (e as Error).message.slice (0, 60));
        }
    }

    // direct lookup by slug (and by id) — grab a real one from the listing first
    const top = await exchange.fetchEvents ({ 'limit': 1 });
    const sample = top[0];
    if (sample !== undefined) {
        const bySlug = await exchange.fetchEvents ({ 'slug': sample.slug });
        console.log (('slug: ' + sample.slug).padEnd (36), '->', summarize (bySlug));
        const byId = await exchange.fetchEvents ({ 'eventId': sample.id });
        console.log (('eventId: ' + sample.id).padEnd (36), '->', summarize (byId));
    }
}

main ();
