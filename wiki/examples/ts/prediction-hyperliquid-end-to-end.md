```javascript
// @NO_AUTO_TRANSPILE
// Hyperliquid prediction end-to-end example (read market data + place/fetch/cancel one order)
//
// Hyperliquid's outcome (prediction) markets trade as spot tokens on the L1. Auth is the
// standard hyperliquid wallet signing: a walletAddress + an L1 privateKey (ECDSA secp256k1).
//
// Flow:
//   1. load markets, read the USDC balance
//   2. pick an outcome with a live two-sided book
//   3. fetch the order book, ticker, OHLCV and recent trades for that outcome
//   4. place a resting limit BUY far below the book, fetch it back, then cancel it
//
// Usage (testnet is the default; set HYPERLIQUID_SANDBOX=false for mainnet — the wallet must
// be funded/onboarded on whichever network you choose):
//   HYPERLIQUID_WALLETADDRESS=0x... HYPERLIQUID_PRIVATEKEY=0x... \
//   npx tsx examples/ts/prediction-hyperliquid-end-to-end.ts

import ccxt from '../../js/ccxt.js';

const MAX_NOTIONAL_USD = 25;     // hard cap per trade
const ORDER_SIZE_SHARES = 220;   // 220 * 0.05 = 11 USD notional, under the cap


async function main () {
    const walletAddress = process.env['HYPERLIQUID_WALLETADDRESS'];
    const privateKey = process.env['HYPERLIQUID_PRIVATEKEY'];
    if (!walletAddress || !privateKey) {
        console.log ('Set HYPERLIQUID_WALLETADDRESS and HYPERLIQUID_PRIVATEKEY env vars first.');
        return;
    }
    const exchange = new ccxt.prediction.hyperliquid ({
        'walletAddress': walletAddress,
        'privateKey': privateKey,
    });
    // outcome markets are deployed on both testnet and mainnet; testnet is the default
    const sandbox = (process.env['HYPERLIQUID_SANDBOX'] || 'true') !== 'false';
    exchange.setSandboxMode (sandbox);
    console.log ('network:', sandbox ? 'testnet' : 'mainnet');

    await exchange.loadMarkets ();
    const balance = await exchange.fetchBalance ();
    console.log ('balance USDC:', JSON.stringify (balance['USDC']));

    // 1) pick an outcome with a live two-sided book and an ask high enough that a
    //    0.05 buy cannot cross it -----------------------------------------------------------
    const outcomeKeys = Object.keys (exchange.outcomes || {});
    let chosen: any = undefined;
    let probes = 0;
    for (const key of outcomeKeys) {
        if (probes >= 60) {
            break;
        }
        probes += 1;
        try {
            const ob = await exchange.fetchOrderBook (key);
            if (ob.bids.length > 0 && ob.asks.length > 0 && (ob.asks[0][0] as number) >= 0.30) {
                chosen = { 'outcome': key, 'orderbook': ob };
                break;
            }
        } catch (e) { /* keep probing */ }
    }
    if (chosen === undefined) {
        console.log ('Could not find an outcome with a suitable two-sided order book right now.');
        return;
    }
    const symbol = chosen.outcome;
    const bestBid = chosen.orderbook.bids[0];
    const bestAsk = chosen.orderbook.asks[0];
    console.log ('\noutcome:', symbol);
    console.log ('orderbook bid/ask:', bestBid, '/', bestAsk);

    // 2) market data for the chosen outcome -------------------------------------------------
    console.log ('\n--- market data ---');
    try {
        const ticker = await exchange.fetchTicker (symbol);
        console.log ('ticker bid/ask/last:', ticker.bid, '/', ticker.ask, '/', ticker.last);
    } catch (e) { console.log ('ticker:        n/a (' + (e as Error).constructor.name + ')'); }
    try {
        const ohlcv = await exchange.fetchOHLCV (symbol, '1h', undefined, 3);
        console.log ('ohlcv (1h x' + ohlcv.length + '): last close', ohlcv.length ? ohlcv[ohlcv.length - 1][4] : 'n/a');
    } catch (e) { console.log ('ohlcv:         n/a (' + (e as Error).constructor.name + ')'); }
    try {
        const trades = await exchange.fetchTrades (symbol, undefined, 3);
        console.log ('recent trades:', trades.length, trades[0] ? ('last @ ' + trades[0].price) : '');
    } catch (e) { console.log ('trades:        n/a (' + (e as Error).constructor.name + ')'); }

    // 3) place a resting limit BUY far below the book, fetch it, then cancel ----------------
    const price = 0.05;     // far below any bid >= 0.10 and any ask >= 0.30, so it cannot fill
    const notional = ORDER_SIZE_SHARES * price;
    console.log ('\n--- order ---');
    console.log ('placing limit BUY', ORDER_SIZE_SHARES, 'shares @', price, '(notional', notional.toFixed (2), 'USD)');
    if (notional >= MAX_NOTIONAL_USD) {
        console.log ('ABORT: notional >= ' + MAX_NOTIONAL_USD + ' USD safety cap.');
        return;
    }

    let order: any = undefined;
    try {
        order = await exchange.createOrder (symbol, 'limit', 'buy', ORDER_SIZE_SHARES, price);
        console.log ('placed:  id', order.id, '| status', order.status);
        const fetched = await exchange.fetchOrder (order.id, symbol);
        console.log ('fetched: id', fetched.id, '| status', fetched.status, '| remaining', fetched.remaining);
    } finally {
        if (order && order.id) {
            const canceled = await exchange.cancelOrder (order.id, symbol);
            console.log ('canceled: id', canceled.id, '| status', canceled.status);
        }
    }
}

main ();

```
