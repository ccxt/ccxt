```javascript
// @NO_AUTO_TRANSPILE
// Myriad prediction end-to-end example (read market data + place/fetch/cancel one order)
//
// Myriad (https://myriad.markets) is a multi-chain prediction market (BSC, Celo, Abstract,
// Linea). Auth is a single L1 privateKey (ECDSA / EIP-712) — the wallet address is derived
// from it, so no apiKey/secret/walletAddress is needed. Orders on order-book ("ob") markets
// are gasless: ccxt signs an EIP-712 order and POSTs it to the book, and the myriad operator
// settles the match on-chain, so the wallet needs collateral but NOT native gas.
//
// WHERE TO GET THE PRIVATE KEY
// ----------------------------
// The privateKey must belong to the wallet that actually holds your Myriad collateral (e.g.
// USD1 on BSC) — i.e. the wallet you trade from in the Myriad UI, NOT necessarily the external
// wallet you logged in with. Myriad provisions an embedded trading wallet for your account, so:
//   1. Open myriad.markets and connect / sign in.
//   2. Go to your account / wallet settings and choose "Export private key" (the embedded
//      trading wallet is managed via Privy; the export option lives in the wallet menu).
//   3. That exported key is the one to use here — it is the address that holds your collateral
//      and signs your orders. (You can confirm it on a block explorer: it should hold the
//      collateral token, e.g. USD1 0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d on BSC.)
//
// Never commit or share this key. Use a low-balance wallet for testing.
//
// Usage:
//   MYRIAD_PRIVATEKEY=0x... npx tsx examples/ts/prediction-myriad-end-to-end.ts

import ccxt from '../../js/ccxt.js';

const MAX_NOTIONAL_USD = 25;     // hard cap per trade
const ORDER_SIZE_SHARES = 5;     // 5 shares * 0.02 = 0.10 collateral notional


async function main () {
    const privateKey = process.env['MYRIAD_PRIVATEKEY'];
    if (!privateKey) {
        console.log ('Set MYRIAD_PRIVATEKEY env var first (see the header for where to export it).');
        return;
    }
    const exchange = new ccxt.prediction.myriad ({
        'privateKey': privateKey,
    });

    // 1) pick an order-book (gasless) outcome with a live two-sided book and an ask high enough
    //    that a 0.02 buy cannot cross it ----------------------------------------------------
    const outcomeKeys = Object.keys (exchange.outcomes || {});
    let chosen: any = undefined;
    let probes = 0;
    for (const key of outcomeKeys) {
        if (probes >= 40) {
            break;
        }
        const outcomeObj = exchange.outcome (key);
        // only order-book markets are gasless; AMM markets need native gas and an explicit opt-in
        if (exchange.safeString (outcomeObj['info'], 'tradingModel') !== 'ob') {
            continue;
        }
        probes += 1;
        try {
            const ob = await exchange.fetchOrderBook (key);
            if (ob.bids.length > 0 && ob.asks.length > 0 && (ob.asks[0][0] as number) >= 0.20) {
                chosen = { 'outcome': key, 'orderbook': ob };
                break;
            }
        } catch (e) { /* keep probing */ }
    }
    if (chosen === undefined) {
        console.log ('Could not find an order-book outcome with a suitable two-sided book right now.');
        return;
    }
    const symbol = chosen.outcome;
    const outcomeObj = exchange.outcome (symbol);
    console.log ('outcome:', symbol, '| network:', exchange.safeString (outcomeObj['info'], 'networkId'));
    console.log ('orderbook bid/ask:', chosen.orderbook.bids[0], '/', chosen.orderbook.asks[0]);

    // 2) market data for the chosen outcome -------------------------------------------------
    console.log ('\n--- market data ---');
    try {
        const ticker = await exchange.fetchTicker (symbol);
        console.log ('ticker bid/ask/last:', ticker.bid, '/', ticker.ask, '/', ticker.last);
    } catch (e) { console.log ('ticker:        n/a (' + (e as Error).constructor.name + ')'); }
    try {
        const trades = await exchange.fetchTrades (symbol, undefined, 3);
        console.log ('recent trades:', trades.length, trades[0] ? ('last @ ' + trades[0].price) : '');
    } catch (e) { console.log ('trades:        n/a (' + (e as Error).constructor.name + ')'); }

    // 3) place a resting limit BUY far below the book, confirm it, then cancel --------------
    const price = 0.02;     // far below any ask >= 0.20, so it cannot fill
    const notional = ORDER_SIZE_SHARES * price;
    console.log ('\n--- order (gasless order book) ---');
    console.log ('placing limit BUY', ORDER_SIZE_SHARES, 'shares @', price, '(notional', notional.toFixed (2), 'USD)');
    if (notional >= MAX_NOTIONAL_USD) {
        console.log ('ABORT: notional >= ' + MAX_NOTIONAL_USD + ' USD safety cap.');
        return;
    }

    let order: any = undefined;
    try {
        order = await exchange.createOrder (symbol, 'limit', 'buy', ORDER_SIZE_SHARES, price, { 'tradingModel': 'ob' });
        console.log ('placed:  id', order.id, '| status', order.status);
        const open = await exchange.fetchOrders (symbol);
        console.log ('orders for outcome:', open.length);
    } finally {
        if (order && order.id) {
            const canceled = await exchange.cancelOrder (order.id, symbol);
            console.log ('canceled: id', canceled.id, '| status', canceled.status);
        }
    }
}

main ();

```
