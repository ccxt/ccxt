// @NO_AUTO_TRANSPILE
// Limitless prediction end-to-end example (read market data + place/fetch/cancel one order)
//
// Limitless is a CLOB prediction market on Base. Auth has two parts:
//   - REST auth: an HMAC API token (apiKey = tokenId, secret) — see
//     https://docs.limitless.exchange/developers/authentication . Mint it from the
//     limitless.exchange "API Tokens" tab (or, headless, via /auth/api-tokens/derive).
//   - Order signing: an L1 privateKey (ECDSA / EIP-712). For a plain EOA profile the maker
//     is your account address; for a smart-wallet profile the embedded owner key signs.
//
// One-time on-chain setup: the maker must approve USDC (collateral) to the limitless
// exchange contract on Base, otherwise orders are rejected with "Insufficient collateral
// allowance". Do this once from the limitless UI (or any wallet) before trading.
//
// Flow:
//   1. load markets + the authenticated account (loadAccounts)
//   2. pick an outcome with a live two-sided book
//   3. fetch the order book, ticker and recent trades for that outcome
//   4. place a resting limit BUY far below the book, confirm it is open, then cancel it
//
// Usage:
//   LIMITLESS_APIKEY=... LIMITLESS_SECRET=... LIMITLESS_PRIVATEKEY=0x... \
//   npx tsx examples/ts/prediction/prediction-limitless-end-to-end.ts
import ccxt from '../../../js/ccxt.js';
const MAX_NOTIONAL_USD = 25; // hard cap per trade
const ORDER_SIZE_SHARES = 110; // 110 * 0.05 = 5.5 USD notional, above the ~100-share minimum
1;
async function main() {
    const apiKey = process.env['LIMITLESS_APIKEY'];
    const secret = process.env['LIMITLESS_SECRET'];
    const privateKey = process.env['LIMITLESS_PRIVATEKEY']; // Private Key of the EOA wallet, smart wallets not support for now
    if (!apiKey || !secret || !privateKey) {
        console.log('Set LIMITLESS_APIKEY, LIMITLESS_SECRET and LIMITLESS_PRIVATEKEY env vars first.');
        return;
    }
    const exchange = new ccxt.prediction.limitless({
        'apiKey': apiKey,
        'secret': secret,
        'privateKey': privateKey,
    });
    await exchange.loadMarkets();
    await exchange.loadAccounts();
    // 1) pick an outcome with a live two-sided book and an ask high enough that a 0.05 buy
    //    cannot cross it; skip the rapid-expiry "_MIN_" markets ----------------------------
    const outcomeKeys = Object.keys(exchange.outcomes || {});
    let chosen = undefined;
    let probes = 0;
    for (const key of outcomeKeys) {
        if (probes >= 150) {
            break;
        }
        if (key.indexOf('_MIN_') !== -1) {
            continue;
        }
        probes += 1;
        try {
            const ob = await exchange.fetchOrderBook(key);
            if (ob.bids.length > 0 && ob.asks.length > 0 && ob.asks[0][0] >= 0.30) {
                chosen = { 'outcome': key, 'orderbook': ob };
                break;
            }
        }
        catch (e) { /* keep probing */ }
    }
    if (chosen === undefined) {
        console.log('Could not find an outcome with a suitable two-sided order book right now.');
        return;
    }
    const symbol = chosen.outcome;
    console.log('outcome:', symbol);
    console.log('orderbook bid/ask:', chosen.orderbook.bids[0], '/', chosen.orderbook.asks[0]);
    // 2) market data for the chosen outcome -------------------------------------------------
    console.log('\n--- market data ---');
    try {
        const ticker = await exchange.fetchTicker(symbol);
        console.log('ticker bid/ask/last:', ticker.bid, '/', ticker.ask, '/', ticker.last);
    }
    catch (e) {
        console.log('ticker:        n/a (' + e.constructor.name + ')');
    }
    try {
        const trades = await exchange.fetchTrades(symbol, undefined, 3);
        console.log('recent trades:', trades.length, trades[0] ? ('last @ ' + trades[0].price) : '');
    }
    catch (e) {
        console.log('trades:        n/a (' + e.constructor.name + ')');
    }
    // 3) place a resting limit BUY far below the book, confirm it, then cancel --------------
    const price = 0.05; // far below any ask >= 0.30, so it cannot fill
    const notional = ORDER_SIZE_SHARES * price;
    console.log('\n--- order ---');
    console.log('placing limit BUY', ORDER_SIZE_SHARES, 'shares @', price, '(notional', notional.toFixed(2), 'USD)');
    if (notional >= MAX_NOTIONAL_USD) {
        console.log('ABORT: notional >= ' + MAX_NOTIONAL_USD + ' USD safety cap.');
        return;
    }
    let order = undefined;
    try {
        order = await exchange.createOrder(symbol, 'limit', 'buy', ORDER_SIZE_SHARES, price);
        console.log('placed:  id', order.id, '| status', order.status);
        const open = await exchange.fetchOpenOrders(symbol);
        console.log('open orders for outcome:', open.length);
    }
    finally {
        if (order && order.id) {
            const canceled = await exchange.cancelOrder(order.id, symbol);
            console.log('canceled: id', canceled.id, '| status', canceled.status);
        }
    }
}
main();
