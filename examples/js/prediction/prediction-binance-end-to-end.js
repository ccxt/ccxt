// @NO_AUTO_TRANSPILE
// Binance prediction end-to-end example (events + market data + trading + history)
//
// Binance aggregates on-chain prediction markets (predict.fun on BNB Chain) behind its
// standard signed SAPI — every endpoint, including market data, needs credentials:
//   - apiKey / secret = a regular binance API key with Web3 Wallet permissions
// A Binance Web3 prediction wallet must exist on the account (create one in the app).
//
// Flow:
//   1. fetchEvents scoped by a search query (binance requires a scope)
//   2. pick an active market + outcome handle, show ticker / order book
//   3. balance
//   4. trading round-trip: createOrder (resting limit) -> fetchOpenOrders -> cancelOrder
//   5. account history: fetchOrders, fetchMyTrades, fetchPositions
//
// Usage:
//   BINANCE_APIKEY=... BINANCE_SECRET=... \
//   npx tsx examples/ts/prediction/prediction-binance-end-to-end.ts
import ccxt from '../../../js/ccxt.js';
const MAX_NOTIONAL_USD = 25; // hard cap per trade
const ORDER_SIZE_SHARES = 10; // 10 shares @ 0.25 = 2.5 USDT notional (>= the ~1.5 minimum)
const ORDER_PRICE = 0.25; // far below a ~0.5 market so the order rests without filling
async function main() {
    const apiKey = process.env['BINANCE_APIKEY'];
    const secret = process.env['BINANCE_SECRET'];
    if (!apiKey || !secret) {
        console.log('Set BINANCE_APIKEY and BINANCE_SECRET env vars first.');
        return;
    }
    const exchange = new ccxt.prediction.binance({
        'apiKey': apiKey,
        'secret': secret,
    });
    // 1) events scoped by a search query ------------------------------------------------------
    console.log('\n--- events (query: btc) ---');
    const events = await exchange.fetchEvents({ 'query': 'btc', 'limit': 5 });
    console.log('events found:', events.length);
    for (const event of events) {
        const markets = (event['markets'] || []);
        console.log('  ' + event['title'] + ' — ' + markets.length + ' markets, ends ' + event['endDatetime']);
    }
    // 2) pick an active outcome + market data -------------------------------------------------
    console.log('\n--- market data ---');
    let outcome = undefined;
    for (const event of events) {
        for (const market of (event['markets'] || [])) {
            const outcomes = (market['outcomes'] || []);
            if (market['active'] && outcomes.length > 0) {
                // the outcome handle looks like MARKET_SLUG_WORDS:UP — it addresses one token
                outcome = outcomes[0]['outcome'];
                break;
            }
        }
        if (outcome) {
            break;
        }
    }
    if (outcome === undefined) {
        console.log('no active markets to trade right now.');
        return;
    }
    console.log('outcome:', outcome);
    const ticker = await exchange.fetchTicker(outcome);
    console.log('last trade price:', ticker['last']);
    const orderbook = await exchange.fetchOrderBook(outcome);
    console.log('orderbook top bid/ask:', orderbook['bids'][0], '/', orderbook['asks'][0]);
    // 3) balance ------------------------------------------------------------------------------
    console.log('\n--- balance ---');
    // the funded payment option is usually CeDeFi; SPOT/FUNDING appear here too
    const balance = await exchange.fetchBalance({ 'type': 'CeDeFi' });
    console.log('USDT free (CeDeFi):', balance['USDT'] ? balance['USDT']['free'] : undefined);
    // 4) trading round-trip: create (resting) -> fetchOpenOrders -> cancel --------------------
    console.log('\n--- order ---');
    const notional = ORDER_SIZE_SHARES * ORDER_PRICE;
    if (notional >= MAX_NOTIONAL_USD) {
        console.log('ABORT: notional >= ' + MAX_NOTIONAL_USD + ' USD safety cap.');
        return;
    }
    let orderId = undefined;
    try {
        // orders require params.accountType: 'SPOT' or 'FUNDING'
        const order = await exchange.createOrder(outcome, 'limit', 'buy', ORDER_SIZE_SHARES, ORDER_PRICE, { 'accountType': 'SPOT' });
        orderId = order['id'];
        console.log('placed:   id', orderId, '| price', ORDER_PRICE, '| shares', ORDER_SIZE_SHARES);
        const open = await exchange.fetchOpenOrders(outcome);
        console.log('open orders for outcome:', open.length);
    }
    finally {
        if (orderId !== undefined) {
            const canceled = await exchange.cancelOrder(orderId, outcome);
            console.log('canceled: id', canceled['id'], '| status', canceled['status']);
        }
    }
    // 5) account history ----------------------------------------------------------------------
    console.log('\n--- history ---');
    const orders = await exchange.fetchOrders(undefined, undefined, 5);
    console.log('recent orders:', orders.length);
    const myTrades = await exchange.fetchMyTrades(undefined, undefined, 5);
    console.log('recent fills:', myTrades.length, myTrades[0] ? ('last ' + myTrades[0]['side'] + ' @ ' + myTrades[0]['price']) : '');
    const positions = await exchange.fetchPositions();
    for (const position of positions) {
        console.log('position:', position['outcome'], '| shares', position['contractSize'], '| entry', position['entryPrice'], '| uPnL', position['unrealizedPnl']);
    }
}
main();
