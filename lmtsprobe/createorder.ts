import ccxt from '../js/ccxt.js';
import fs from 'fs';

async function main () {
    const k = JSON.parse (fs.readFileSync ('keys.local.json', 'utf8')).limitless;
    const ex = new (ccxt as any).prediction.limitless ({
        'apiKey': k.apiKey, 'secret': k.secret, 'walletAddress': k.walletAddress, 'privateKey': k.privateKey,
    });
    await ex.loadMarkets ();
    // pick a longer-dated CLOB market with a usable orderbook
    let outcome = undefined; let book = undefined;
    for (const m of Object.values (ex.markets) as any[]) {
        const slug = m.info && m.info.slug;
        if (!slug || !(m.info && m.info.venue && m.info.venue.exchange) || !m.outcomes || !m.outcomes.length) continue;
        if (slug.indexOf ('5-min') !== -1 || slug.indexOf ('hourly') !== -1) continue;
        try {
            const ob = await ex.fetchOrderBook (m.outcomes[0].outcome);
            if (ob && ob.bids && ob.bids.length && ob.bids[0][0] > 0.05) { outcome = m.outcomes[0].outcome; book = ob; break; }
        } catch (e) { /* skip */ }
    }
    if (!outcome) { console.log ('no suitable market'); return; }
    console.log ('market outcome', outcome, 'bestBid', book.bids[0], 'bestAsk', book.asks && book.asks[0]);
    // GTC postOnly BUY far below market: 5 shares @ 0.02 -> notional 0.10 USDC
    console.log ('>>> placing order');
    const placed = await ex.createOrder (outcome, 'limit', 'buy', 5, 0.02, { 'timeInForce': 'GTC', 'postOnly': true });
    console.log ('PLACED id', placed.id, 'status', placed.status);
    await new Promise ((r) => setTimeout (r, 4500));
    const open = await ex.fetchOpenOrders (outcome);
    const mine = open.filter ((o) => o.id === placed.id);
    console.log ('fetchOpenOrders:', open.length, 'mine present:', mine.length > 0);
    console.log ('>>> cancelling', placed.id);
    const canceled = await ex.cancelOrder (placed.id, outcome);
    console.log ('CANCELED:', JSON.stringify (canceled.info || canceled).slice (0, 200));
    await new Promise ((r) => setTimeout (r, 1500));
    const after = await ex.fetchOpenOrders (outcome);
    const still = after.filter ((o) => o.id === placed.id);
    console.log ('after cancel, mine still open:', still.length > 0, '(should be false)');
}

main ().catch ((e) => { console.error ('ERR', e.constructor.name, e.message); process.exit (1); });
