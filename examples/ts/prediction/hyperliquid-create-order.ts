import ccxt from '../../../js/ccxt.js';

async function example () {

    const exchange = new ccxt.prediction.hyperliquid ({
        'walletAddress': 'YOUR_WALLET_ADDRESS',  // main account address (for balance/info queries)
        'privateKey': 'YOUR_PRIVATE_KEY',  // API wallet private key (authorized agent of main account)
        'sandboxMode': true,  // outcome markets are on testnet
    });

    // exchange.verbose = true; // uncomment for debugging

    // Fetch outcome events (groups YES+NO outcomes by underlying)
    const events = await exchange.fetchEvents ({ 'queries': [ 'BTC' ] });
    console.log ('Total outcome events:', events.length);

    if (events.length === 0) {
        console.log ('No outcome events found on testnet.');
        return;
    }

    // Pick the first tradable (non-fallback) market/outcome.
    let event = undefined;
    let market = undefined;
    let outcome = undefined;
    for (let ei = 0; ei < events.length; ei++) {
        const markets = events[ei].markets || [];
        for (let mi = 0; mi < markets.length; mi++) {
            const m = markets[mi];
            const outcomes = m.outcomes || [];
            for (let oi = 0; oi < outcomes.length; oi++) {
                const symbol = outcomes[oi].outcome;
                if (typeof symbol === 'string' && symbol.includes ('OTHER')) {
                    continue;
                }
                event = events[ei];
                market = m;
                outcome = symbol;
                break;
            }
            if (outcome) {
                break;
            }
        }
        if (outcome) {
            break;
        }
    }

    if (!outcome) {
        console.log ('No tradable non-fallback outcome found. All sampled markets are fallback tokens (OTHER-*).');
        return;
    }
    console.log ('\nUsing event:', event.title);
    console.log ('Using market:', market.symbol);
    console.log ('Using outcome:', outcome);
    console.log ('Description:', market.info.description);

    // Fetch the current order book to get a realistic bid/ask price
    const orderBook = await exchange.fetchOrderBook (outcome);
    const bestBid = orderBook.bids.length > 0 ? orderBook.bids[0][0] : 0.45;
    const bestAsk = orderBook.asks.length > 0 ? orderBook.asks[0][0] : 0.55;
    console.log ('\nBest bid:', bestBid, '  Best ask:', bestAsk);

    // Place a limit BUY order just below the best bid (passive/resting order)
    const buyPrice  = parseFloat ((bestBid * 0.98).toFixed (4));  // 2% below best bid
    // Hyperliquid testnet currently enforces min notional ~= 10 USDH
    const minNotional = 10;
    const minAmount = Math.ceil (minNotional / buyPrice);
    const amount = Math.max (1, minAmount);
    console.log ('\nPlacing limit BUY order:');
    console.log ('  outcome:', outcome, '  price:', buyPrice, '  amount:', amount);

    const buyOrder = await exchange.createOrder (outcome, 'limit', 'buy', amount, buyPrice);
    console.log ('Buy order placed:', buyOrder);
    console.log ('  order id:', buyOrder.id, '  status:', buyOrder.status);

    // Place a limit SELL order just above the best ask (passive/resting order)
    // const sellPrice = parseFloat ((bestAsk * 1.02).toFixed (4)); // 2% above best ask
    // console.log ('\nPlacing limit SELL order:');
    // console.log ('  outcome:', outcome, '  price:', sellPrice, '  amount:', amount);

    // const sellOrder = await exchange.createOrder (outcome, 'limit', 'sell', amount, sellPrice);
    // console.log ('Sell order placed:', sellOrder);
    // console.log ('  order id:', sellOrder.id, '  status:', sellOrder.status);

    // Fetch open orders to confirm both are resting
    const openOrders = await exchange.fetchOpenOrders (outcome);
    console.log ('\nOpen orders after placement (', openOrders.length, '):');
    console.log (openOrders);
    for (const order of openOrders) {
        console.log ('  id:', order.id, '  side:', order.side, '  price:', order.price, '  amount:', order.amount, '  status:', order.status);
    }

    // Cancel both orders
    console.log ('\nCancelling buy order id:', buyOrder.id);
    await exchange.cancelOrder (buyOrder.id, outcome);

    // console.log ('Cancelling sell order id:', sellOrder.id);
    // await exchange.cancelOrder (sellOrder.id, outcome);

    // Confirm orders are gone
    const remainingOrders = await exchange.fetchOpenOrders (outcome, undefined, undefined);
    console.log ('\nOpen orders after cancellation (', remainingOrders.length, '):');
    console.log (remainingOrders);
}
await example ();
