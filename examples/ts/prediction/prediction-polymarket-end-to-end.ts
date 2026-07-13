// @NO_AUTO_TRANSPILE
// Polymarket end-to-end example (read market data + place/fetch/cancel one order)
//
// Flow:
//   1. pick a high-volume event, a market inside it, and an outcome with a live two-sided book
//   2. fetch the order book, ticker, OHLCV, open interest and recent trades for that outcome
//   3. place a resting limit BUY, fetch it back, then cancel it
//
// Usage:
//   polymarket_privateKey=0x... polymarket_walletAddress=0x... \
//   npx tsx examples/ts/prediction/prediction-polymarket-end-to-end.ts

import ccxt from '../../../js/ccxt.js';

const MAX_NOTIONAL_USD = 25;     // hard cap per trade
const ORDER_SIZE_SHARES = 5;     // polymarket minimum order size


async function main () {
    const privateKey = process.env['POLYMARKET_PRIVATEKEY'];
    const walletAddress = process.env['POLYMARKET_WALLETADDRESS'];
    if (!privateKey || !walletAddress) {
        console.log ('Set POLYMARKET_PRIVATEKEY and POLYMARKET_WALLETADDRESS env vars first.');
        return;
    }
    const options: any = {};
    const exchange = new ccxt.prediction.polymarket ({
        'privateKey': privateKey,
        'walletAddress': walletAddress,
        'options': options,
    });

    // 1) pick a high-volume event and an outcome with a live two-sided book ----------------
    const events = await exchange.fetchEvents ({ 'sort': 'volume', 'limit': 15 });
    let chosen: any = undefined;
    let probes = 0;
    for (const ev of events) {
        for (const market of (ev.markets || [])) {
            for (const oc of (market.outcomes || [])) {
                if (probes >= 20) {
                    break;
                }
                probes += 1;
                const ob = await exchange.fetchOrderBook (oc.outcome);
                if (ob.bids.length > 0 && ob.asks.length > 0) {
                    chosen = { 'event': ev, 'market': market, 'outcome': oc, 'orderbook': ob };
                    break;
                }
            }
            if (chosen) break;
        }
        if (chosen) break;
    }
    if (chosen === undefined) {
        console.log ('Could not find an outcome with a live two-sided order book right now.');
        return;
    }
    // the tradeable handle is the outcome's `outcome` field ("MARKET:LABEL")
    const symbol = chosen.outcome.outcome;
    console.log ('event:   ', chosen.event.title);
    console.log ('market:  ', chosen.market.symbol);
    console.log ('outcome: ', symbol, '(' + (chosen.outcome.label || '') + ')');

    // 2) market data for the chosen outcome -------------------------------------------------
    const bestBid = chosen.orderbook.bids[0];
    const bestAsk = chosen.orderbook.asks[0];
    console.log ('\n--- market data ---');
    console.log ('orderbook bid/ask:', bestBid, '/', bestAsk);
    try {
        const ticker = await exchange.fetchTicker (symbol);
        console.log ('ticker bid/ask/last:', ticker.bid, '/', ticker.ask, '/', ticker.last);
    } catch (e) { console.log ('ticker:        n/a (' + (e as Error).constructor.name + ')'); }
    try {
        const ohlcv = await exchange.fetchOHLCV (symbol, '1h', undefined, 3);
        console.log ('ohlcv (1h x' + ohlcv.length + '): last close', ohlcv.length ? ohlcv[ohlcv.length - 1][4] : 'n/a');
    } catch (e) { console.log ('ohlcv:         n/a (' + (e as Error).constructor.name + ')'); }
    try {
        const oi = await exchange.fetchOpenInterest (symbol);
        console.log ('open interest:', oi.openInterestValue);
    } catch (e) { console.log ('open interest: n/a (' + (e as Error).constructor.name + ')'); }
    try {
        const trades = await exchange.fetchTrades (symbol, undefined, 3);
        console.log ('recent trades:', trades.length, trades[0] ? ('last @ ' + trades[0].price) : '');
    } catch (e) { console.log ('trades:        n/a (' + (e as Error).constructor.name + ')'); }

    // 3) place a resting limit BUY well below the book, fetch it, then cancel ----------------
    const tick = (chosen.outcome.precision && chosen.outcome.precision.price) ? chosen.outcome.precision.price : 0.01;
    const bidPrice = bestBid[0];
    // half the best bid, floored to the tick — far below the ask, so it cannot fill
    let price = Math.floor ((bidPrice * 0.5) / tick) * tick;
    price = Math.max (tick, Number (price.toFixed (4)));
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
