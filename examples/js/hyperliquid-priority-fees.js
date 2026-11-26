import ccxt from '../../js/ccxt.js';
// Hyperliquid order priority fees
// https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/priority-fees
//
// A priority fee gets an order processed sooner. It is set with the priorityFee param,
// an integer rate in units of 1e-8, so 10000 is 1 basis point (0.01%) of the order notional.
//
// - it is only accepted when every order in the request is IOC (market orders included),
//   or when every order is post-only and not reduce-only
// - it can't be combined with attached stopLoss / takeProfit orders
// - it is paid in HYPE from the undelegated staking balance, not from the trading balance
// - IOC orders pay on the filled notional, an IOC that does not fill pays nothing
// - post-only orders pay on the resting notional when placed, even if they never fill
async function example() {
    const exchange = new ccxt.hyperliquid({
        'walletAddress': 'MY_WALLET_ADDRESS',
        'privateKey': 'MY_PRIVATE_KEY',
    });
    await exchange.loadMarkets();
    const symbol = 'SOL/USDC:USDC';
    const amount = 0.2;
    const ticker = await exchange.fetchTicker(symbol);
    const last = ticker['last'];
    const priorityFee = 10000; // 1 basis point
    try {
        // a market order is sent as IOC, the price is only used to compute the max slippage price
        const marketOrder = await exchange.createOrder(symbol, 'market', 'buy', amount, last, {
            'priorityFee': priorityFee,
        });
        console.log(marketOrder);
        // an IOC limit order
        const iocOrder = await exchange.createOrder(symbol, 'limit', 'sell', amount, last * 0.99, {
            'timeInForce': 'IOC',
            'reduceOnly': true,
            'priorityFee': priorityFee,
        });
        console.log(iocOrder);
        // a post-only order, the fee is charged when the order is placed
        const postOnlyOrder = await exchange.createOrder(symbol, 'limit', 'buy', amount, last * 0.95, {
            'postOnly': true,
            'priorityFee': priorityFee,
        });
        console.log(postOnlyOrder);
        // one fee for a whole batch, every order must be of the same kind
        const orders = await exchange.createOrders([
            { 'symbol': symbol, 'type': 'limit', 'side': 'buy', 'amount': amount, 'price': last * 0.94, 'params': { 'postOnly': true } },
            { 'symbol': symbol, 'type': 'limit', 'side': 'buy', 'amount': amount, 'price': last * 0.93, 'params': { 'postOnly': true } },
        ], { 'priorityFee': priorityFee });
        console.log(orders);
    }
    catch (e) {
        console.log(e.toString());
    }
}
await example();
