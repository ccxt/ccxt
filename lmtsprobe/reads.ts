import ccxt from '../js/ccxt.js';
import fs from 'fs';

// Live-test every HMAC-only private endpoint (no EIP-712 / private key needed).
async function run (label: string, fn: () => Promise<any>) {
    try {
        const r = await fn ();
        const n = Array.isArray (r) ? r.length : (r ? 1 : 0);
        console.log ('PASS  ' + label + '  -> ' + n + ' item(s)');
    } catch (e) {
        const name = e.constructor.name;
        // OrderNotFound / "not found" on a fake id still proves the endpoint + auth path work
        const reached = (name === 'OrderNotFound') || (e.message && e.message.indexOf ('not found') !== -1) || (e.message && e.message.indexOf ('already canceled') !== -1);
        console.log ((reached ? 'PASS* ' : 'FAIL  ') + label + '  -> ' + name + ': ' + (e.message || '').slice (0, 120));
    }
}

async function main () {
    const keys = JSON.parse (fs.readFileSync ('keys.local.json', 'utf8')).limitless;
    const ex = new (ccxt as any).prediction.limitless ({ 'apiKey': keys.apiKey, 'secret': keys.secret, 'walletAddress': keys.walletAddress });
    await ex.loadMarkets ();
    // pick a CLOB market outcome + slug
    let outcome = undefined; let slug = undefined;
    for (const m of Object.values (ex.markets) as any[]) {
        if (m.info && m.info.venue && m.info.venue.exchange && m.outcomes && m.outcomes.length) {
            outcome = m.outcomes[0].outcome; slug = m.info.slug; break;
        }
    }
    console.log ('using outcome', outcome, 'slug', slug, '\n');
    await run ('fetchAccounts', () => ex.fetchAccounts ());
    await run ('fetchPositions', () => ex.fetchPositions ());
    await run ('fetchMyTrades (all)', () => ex.fetchMyTrades ());
    await run ('fetchMyTrades (outcome)', () => ex.fetchMyTrades (outcome));
    await run ('fetchOrders (outcome)', () => ex.fetchOrders (outcome));
    await run ('fetchOpenOrders (outcome)', () => ex.fetchOpenOrders (outcome));
    await run ('fetchClosedOrders (outcome)', () => ex.fetchClosedOrders (outcome));
    await run ('fetchOrder (fake id)', () => ex.fetchOrder ('11111111-1111-4111-8111-111111111111', outcome));
    await run ('fetchOrdersByIds (fake id)', () => ex.fetchOrdersByIds ([ '11111111-1111-4111-8111-111111111111' ], outcome));
    await run ('cancelOrder (fake id)', () => ex.cancelOrder ('11111111-1111-4111-8111-111111111111', outcome));
    await run ('cancelOrders (fake id)', () => ex.cancelOrders ([ '11111111-1111-4111-8111-111111111111' ], outcome));
    await run ('cancelAllOrders (slug, no-op)', () => ex.cancelAllOrders (undefined, { 'slug': slug, 'warnOnCancelAllOrdersWithOutcome': false }));
}

main ().catch ((e) => { console.error ('ERR', e.message); process.exit (1); });
