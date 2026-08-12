```javascript
// @NO_AUTO_TRANSPILE
// Polymarket: will Spain win the World Cup? (fetch odds + place/cancel one order)
//
// Flow:
//   1. search Polymarket events for the World Cup winner event and pick the Spain market
//   2. fetch the YES outcome's ticker and order book — the YES price is the implied probability
//   3. place a resting limit BUY well below the book (so it cannot fill), fetch it back, then cancel it
//
// Usage:
//   POLYMARKET_PRIVATEKEY=0x... POLYMARKET_WALLETADDRESS=0x... \
//   npx tsx examples/ts/prediction-polymarket-spain-world-cup.ts
//
// Accounts funded through a Polymarket deposit/proxy wallet also need:
//   POLYMARKET_FUNDER=0x...         (the deposit wallet address)
//   POLYMARKET_SIGNATURETYPE=3      (0=EOA, 1=POLY_PROXY, 2=GNOSIS_SAFE, 3=POLY_1271)

import ccxt from '../../js/ccxt.js';

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
    if (process.env['POLYMARKET_FUNDER']) {
        options['funder'] = process.env['POLYMARKET_FUNDER'];
    }
    if (process.env['POLYMARKET_SIGNATURETYPE']) {
        options['signatureType'] = Number (process.env['POLYMARKET_SIGNATURETYPE']);
    }
    const exchange = new ccxt.prediction.polymarket ({
        'privateKey': privateKey,
        'walletAddress': walletAddress,
        'options': options,
    });
    try {
        // 1) find the Spain market inside the World Cup winner event --------------------------
        const events = await exchange.fetchEvents ({ 'query': 'World Cup Winner', 'limit': 10 });
        let spainMarket: any = undefined;
        let worldCupEvent: any = undefined;
        for (const ev of events) {
            for (const market of (ev.markets || [])) {
                const title = (market.title || market.market || '').toLowerCase ();
                if (title.indexOf ('spain') !== -1) {
                    worldCupEvent = ev;
                    spainMarket = market;
                    break;
                }
            }
            if (spainMarket) break;
        }
        if (spainMarket === undefined) {
            console.log ('Could not find a Spain market in the World Cup winner event.');
            return;
        }
        // the YES outcome's price is the market-implied probability that Spain wins
        let yesOutcome: any = undefined;
        for (const oc of (spainMarket.outcomes || [])) {
            if (oc.label === 'Yes') {
                yesOutcome = oc;
                break;
            }
        }
        if (yesOutcome === undefined) {
            console.log ('The Spain market has no YES outcome.');
            return;
        }
        // the tradeable handle is the outcome's `outcome` field ("MARKET:LABEL")
        const symbol = yesOutcome.outcome;
        console.log ('event:   ', worldCupEvent.title);
        console.log ('market:  ', spainMarket.symbol);
        console.log ('outcome: ', symbol);

        // 2) is Spain going to win? the YES price is the implied probability ------------------
        const orderbook = await exchange.fetchOrderBook (symbol);
        const bestBid = orderbook.bids.length ? orderbook.bids[0] : undefined;
        const bestAsk = orderbook.asks.length ? orderbook.asks[0] : undefined;
        console.log ('\n--- odds ---');
        console.log ('orderbook bid/ask:', bestBid, '/', bestAsk);
        const ticker = await exchange.fetchTicker (symbol);
        console.log ('ticker bid/ask/last:', ticker.bid, '/', ticker.ask, '/', ticker.last);
        const yesPrice = (ticker.last !== undefined) ? ticker.last : ticker.bid;
        if (yesPrice !== undefined) {
            console.log ('market says Spain wins the World Cup with ~' + (yesPrice * 100).toFixed (1) + '% probability');
        }
        if (bestBid === undefined || bestAsk === undefined) {
            console.log ('No two-sided order book right now — skipping the order.');
            return;
        }

        // 3) place a resting limit BUY well below the book, fetch it, then cancel -------------
        const tick = (yesOutcome.precision && yesOutcome.precision.price) ? yesOutcome.precision.price : 0.01;
        // half the best bid, floored to the tick — far below the ask, so it cannot fill
        let price = Math.floor ((bestBid[0] * 0.5) / tick) * tick;
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
    } finally {
        await exchange.close ();
    }
}

main ();

```
