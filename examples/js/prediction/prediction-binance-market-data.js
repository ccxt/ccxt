// @NO_AUTO_TRANSPILE
// Binance Web3 Wallet prediction market-data example (events + ticker + order book)
//
// Binance aggregates on-chain prediction markets (predict.fun on BNB Chain) behind its
// standard signed SAPI. EVERY endpoint — including market data — is signed, so a
// production Binance API key + secret are required (the spot demo-trading environment
// does not expose the prediction endpoints).
//
// Flow:
//   1. fetchEvents scoped by a search query (binance requires a search / category scope)
//   2. pick an active outcome and show its ticker (last trade price)
//   3. show the outcome token's order book
//
// Usage:
//   BINANCE_APIKEY=... BINANCE_SECRET=... \
//   npx tsx examples/ts/prediction/prediction-binance-market-data.ts
import ccxt from '../../../js/ccxt.js';
async function main() {
    const apiKey = process.env['BINANCE_APIKEY'];
    const secret = process.env['BINANCE_SECRET'];
    if (!apiKey || !secret) {
        console.log('Set BINANCE_APIKEY and BINANCE_SECRET env vars first (production keys — all prediction endpoints are signed).');
        return;
    }
    const exchange = new ccxt.prediction.binance({
        'apiKey': apiKey,
        'secret': secret,
    });
    // 1) events need a scope: a free-text query (semantic search) or an l1Category/l2Category
    //    listing filter (discover category ids via exchange.sapiPrivateGetCategoryList ())
    const events = await exchange.fetchEvents({ 'query': 'bitcoin', 'limit': 5 });
    console.log('found', events.length, 'events');
    for (const event of events) {
        console.log('-', event['id'], event['title'], '| markets:', event['markets'].length, '| active:', event['active']);
    }
    // 2) pick the first active outcome and fetch its ticker
    for (const event of events) {
        for (const market of event['markets']) {
            if (!market['active']) {
                continue;
            }
            const outcome = market['outcomes'][0];
            const handle = outcome['outcome'];
            console.log('using outcome:', handle, '| tokenId:', outcome['outcomeId']);
            const ticker = await exchange.fetchTicker(handle);
            console.log('last price:', ticker['last']);
            // 3) the outcome token's order book
            const orderbook = await exchange.fetchOrderBook(handle);
            console.log('best bid:', orderbook['bids'][0], '| best ask:', orderbook['asks'][0]);
            await exchange.close();
            return;
        }
    }
    console.log('no active outcome found');
    await exchange.close();
}
await main();
