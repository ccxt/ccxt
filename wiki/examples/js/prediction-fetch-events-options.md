```javascript
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
// fetchEvents must be scoped by at least one of query/queries/tags/eventId/slug; the other
// options (limit/sort/status/searchIn) refine that scoped result.
//
// Where the exchange API supports a param it is pushed server-side (polymarket maps
// sort -> order, status -> active/closed, eventId/slug -> the events endpoint); otherwise
// it is applied client-side, so every exchange supports the same options uniformly.
//
// Usage:
//   npx tsx examples/ts/prediction-fetch-events-options.ts
import ccxt from '../../js/ccxt.js';
function summarize(events, n = 3) {
    const titles = [];
    for (let i = 0; i < Math.min(n, events.length); i++) {
        titles.push((events[i].title || events[i].event || '').slice(0, 40));
    }
    return events.length + ' events  [' + titles.join(' | ') + ']';
}
async function main() {
    const exchange = new ccxt.prediction.polymarket();
    const cases = [
        ['query: Fed', { query: 'Fed' }],
        ['query: Fed, limit 3', { query: 'Fed', limit: 3 }],
        ['query: Fed, sort newest', { query: 'Fed', sort: 'newest', limit: 3 }],
        ['query: Fed, sort liquidity', { query: 'Fed', sort: 'liquidity', limit: 3 }],
        ['query: Fed, status closed', { query: 'Fed', status: 'closed', limit: 3 }],
        ['query: Fed, searchIn title', { query: 'Fed', searchIn: 'title' }],
        ['query: Fed, searchIn description', { query: 'Fed', searchIn: 'description' }],
    ];
    for (const [label, params] of cases) {
        try {
            const events = await exchange.fetchEvents(params);
            console.log(label.padEnd(36), '->', summarize(events));
        }
        catch (e) {
            console.log(label.padEnd(36), '-> error:', e.message.slice(0, 60));
        }
    }
    // direct lookup by slug (and by id) — grab a real one from a scoped listing first
    const top = await exchange.fetchEvents({ 'query': 'Fed', 'limit': 1 });
    const sample = top[0];
    if (sample !== undefined) {
        const bySlug = await exchange.fetchEvents({ 'slug': sample.slug });
        console.log(('slug: ' + sample.slug).padEnd(36), '->', summarize(bySlug));
        const byId = await exchange.fetchEvents({ 'eventId': sample.id });
        console.log(('eventId: ' + sample.id).padEnd(36), '->', summarize(byId));
    }
}
main();

```
