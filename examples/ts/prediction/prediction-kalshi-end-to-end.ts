// @NO_AUTO_TRANSPILE
// Kalshi prediction end-to-end example (events + resolution + trading + history)
//
// Kalshi is a regulated CLOB prediction exchange. Auth is RSA-PSS request signing:
//   - apiKey    = the API key id (a UUID) from the Kalshi "API Keys" page
//   - privateKey = the RSA private key (PEM) paired with that key id
// See https://trading-api.readme.io/reference/api-keys .
//
// Kalshi has a demo environment (https://demo-api.kalshi.co) with play money — the safe
// place to run a trading example. This example uses it by default; set KALSHI_SANDBOX=false
// to hit production with real funds (respecting the 25 USD per-trade cap below).
//
// Flow:
//   1. fetchEvents scoped by tag (kalshi requires a search scope) + show resolution status
//   2. pick an active outcome and show its ticker / order book
//   3. trading round-trip: createOrder (resting) -> editOrder -> fetchOpenOrders -> cancelOrder
//   4. account history: fetchOrders, fetchMyTrades, fetchSettlements
//
// Usage:
//   KALSHI_APIKEY=... KALSHI_PRIVATEKEY="$(cat rsa_key.pem)" \
//   npx tsx examples/ts/prediction/prediction-kalshi-end-to-end.ts

import ccxt from '../../../js/ccxt.js';

const MAX_NOTIONAL_USD = 25;     // hard cap per trade
const ORDER_SIZE_CONTRACTS = 1;  // 1 contract @ 0.02 = 0.02 USD notional


async function main () {
    const apiKey = process.env['KALSHI_APIKEY'];
    const privateKey = process.env['KALSHI_PRIVATEKEY'];
    if (!apiKey || !privateKey) {
        console.log ('Set KALSHI_APIKEY and KALSHI_PRIVATEKEY (RSA PEM) env vars first.');
        return;
    }
    const exchange = new ccxt.prediction.kalshi ({
        'apiKey': apiKey,
        'privateKey': privateKey,
    });
    // demo by default; KALSHI_SANDBOX=false hits production (real money)
    const useSandbox = (process.env['KALSHI_SANDBOX'] !== 'false');
    exchange.setSandboxMode (useSandbox);
    console.log ('environment:', useSandbox ? 'demo (sandbox)' : 'production');

    // 1) events scoped by tag + resolution status -------------------------------------------
    console.log ('\n--- events (tag: BTC) ---');
    const events = await exchange.fetchEvents ({ 'tags': [ 'BTC' ], 'limit': 3 });
    console.log ('events found:', events.length);
    for (const event of events) {
        const markets = (event['markets'] || []) as any[];
        const resolved = markets.filter ((m) => m['resolved']).length;
        console.log ('  ' + event['event'] + ' — ' + markets.length + ' markets, ' + resolved + ' resolved');
        for (const market of markets) {
            if (market['resolved']) {
                console.log ('    resolved: ' + market['symbol'] + ' -> winner ' + market['resolvedOutcome']);
            }
        }
    }

    // 2) pick an active outcome + market data -----------------------------------------------
    console.log ('\n--- market data ---');
    const markets = await exchange.fetchMarkets ();
    const active = markets.filter ((m) => m['active'] && ((m['outcomes'] || []) as any[]).length >= 1);
    if (active.length === 0) {
        console.log ('no active markets to trade right now.');
        return;
    }
    const market = active[0];
    const outcomes = market['outcomes'] as any[];
    const yesOutcome = outcomes.find ((o) => (o['label'] || '').toUpperCase () === 'YES') || outcomes[0];
    // kalshi addresses an outcome by its ticker (the YES leg id); the NO leg is <ticker>-NO
    const symbol = yesOutcome['outcomeId'];
    console.log ('outcome:', symbol);
    try {
        const ticker = await exchange.fetchTicker (symbol);
        console.log ('ticker bid/ask/last:', ticker.bid, '/', ticker.ask, '/', ticker.last);
    } catch (e) { console.log ('ticker:  n/a (' + (e as Error).constructor.name + ')'); }
    try {
        const ob = await exchange.fetchOrderBook (symbol);
        console.log ('orderbook top bid/ask:', ob.bids[0], '/', ob.asks[0]);
    } catch (e) { console.log ('orderbook: n/a (' + (e as Error).constructor.name + ')'); }

    // 3) trading round-trip: create -> edit -> cancel ---------------------------------------
    const price = 0.02;    // far below market so it rests without filling
    const notional = ORDER_SIZE_CONTRACTS * price;
    console.log ('\n--- order ---');
    if (notional >= MAX_NOTIONAL_USD) {
        console.log ('ABORT: notional >= ' + MAX_NOTIONAL_USD + ' USD safety cap.');
        return;
    }
    let orderId: any = undefined;
    try {
        const order = await exchange.createOrder (symbol, 'limit', 'buy', ORDER_SIZE_CONTRACTS, price);
        orderId = order['id'];
        console.log ('placed:   id', orderId, '| status', order['status'], '| price', order['price']);
        // edit: bump the price (cancel + recreate — kalshi has no live amend)
        const edited = await exchange.editOrder (orderId, symbol, 'limit', 'buy', ORDER_SIZE_CONTRACTS, 0.03);
        orderId = edited['id'];
        console.log ('edited:   id', orderId, '| price', edited['price'], '| status', edited['status']);
        const open = await exchange.fetchOpenOrders (symbol);
        console.log ('open orders for outcome:', open.length);
    } finally {
        if (orderId !== undefined) {
            const canceled = await exchange.cancelOrder (orderId, symbol);
            console.log ('canceled: id', canceled['id'], '| status', canceled['status']);
        }
    }

    // 4) account history --------------------------------------------------------------------
    console.log ('\n--- history ---');
    try {
        const orders = await exchange.fetchOrders (undefined, undefined, 5);
        console.log ('recent orders:', orders.length);
    } catch (e) { console.log ('orders:      n/a (' + (e as Error).constructor.name + ')'); }
    try {
        const myTrades = await exchange.fetchMyTrades (undefined, undefined, 5);
        console.log ('recent fills:', myTrades.length, myTrades[0] ? ('last ' + myTrades[0].side + ' @ ' + myTrades[0].price) : '');
    } catch (e) { console.log ('myTrades:    n/a (' + (e as Error).constructor.name + ')'); }
    try {
        const settlements = await exchange.fetchSettlements (undefined, undefined, 5);
        const won = settlements.filter ((s) => s['won']).length;
        console.log ('settlements:', settlements.length, '(' + won + ' won)');
    } catch (e) { console.log ('settlements: n/a (' + (e as Error).constructor.name + ')'); }
}

main ();
