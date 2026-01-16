- [Hibachi Example](./examples/js/)


 ```javascript
 import { hibachi } from '../../js/ccxt.js';
import fs from 'fs';
/*
    In order to run the examples, you need to setup keys.local.json file like this:
    ```
    {
        "hibachi": {
            "accountId": 111,
            "apiKey": "1111111111111111111111111111111111111111111=",
            "privateKey": "0x1111111111111111111111111111111111111111111111111111111111111111",
            "publicKey": "0x11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
            "withdrawAddress": "0x1111111111111111111111111111111111111111"
        }
    }
    ```
    You can get the accountId, apiKey and privateKey from Hibachi App by creating an API key
    After that you can view the API key, it will show the publicKey (only for trustless account, you can ignore it for exchange managed account)
    Note: if you are using exchange managed account, the privateKey's length will be 44 instead
    The withdrawAddress can be any ethereum wallet address, that is used to receive funds for withdraw tests
*/
async function example() {
    const keys = JSON.parse(fs.readFileSync('keys.local.json', 'utf-8'));
    const exchange = new hibachi(keys.hibachi);
    exchange.verbose = true;
    const markets = await exchange.fetchMarkets();
    console.log('fetchMarkets', markets.length, markets[0]);
    const currencies = await exchange.fetchCurrencies();
    console.dir(currencies, { depth: null, colors: true });
    const trades = await exchange.fetchTrades("BTC/USDT:USDT");
    console.log('fetchTrades', trades.length, trades[0]);
    const tenMinutes = 10 * 60 * 1000;
    const until = Date.now();
    const since = until - tenMinutes;
    const ohlcv = await exchange.fetchOHLCV('BTC/USDT:USDT', '5min', since, 100, { until });
    console.log('fetchOHLCV', ohlcv.length, ohlcv[0]);
    const balance = await exchange.fetchBalance();
    console.dir(balance, { depth: null, colors: true });
    const ticker = await exchange.fetchTicker('BTC/USDT:USDT');
    console.log('fetchTicker', ticker);
    // createOrder, editOrder and cancelOrder
    const order1 = await exchange.createOrder('BTC/USDT:USDT', 'market', 'buy', 0.00002);
    const order2 = await exchange.createOrder('BTC/USDT:USDT', 'market', 'sell', 0.00002);
    console.log('create market order', order1.id, order2.id);
    const order3 = await exchange.createOrder('ETH/USDT:USDT', 'limit', 'buy', 1.234, 1.234);
    const order4 = await exchange.editOrder(order3.id, 'ETH/USDT:USDT', 'limit', 'buy', 0.987, 1.123);
    const order5 = await exchange.cancelOrder(order3.id);
    console.log('create, edit and cancel limit order', order3.id, order4.id, order5.id);
    // advanced order parameters
    const postOnlyOrder = await exchange.createOrder('BTC/USDT:USDT', 'limit', 'buy', 2.0, 2.0, { 'timeInForce': 'PO' });
    await exchange.cancelOrder(postOnlyOrder.id);
    const iocOrder = await exchange.createOrder('BTC/USDT:USDT', 'limit', 'buy', 2.0, 2.0, { 'timeInForce': 'IOC' });
    await exchange.createOrder('BTC/USDT:USDT', 'market', 'buy', 0.00002);
    const reduceOnlyOrder = await exchange.createOrder('BTC/USDT:USDT', 'market', 'sell', 0.00002, undefined, { 'reduceOnly': true });
    const triggerOrder = await exchange.createOrder('BTC/USDT:USDT', 'limit', 'sell', 2.0, 2.0, { 'triggerPrice': '2.0' });
    await exchange.cancelOrder(triggerOrder.id);
    console.log('postOnly, IOC, reduceOnly, trigger order', postOnlyOrder.id, iocOrder.id, reduceOnlyOrder.id, triggerOrder.id);
    const order1_info = await exchange.fetchOrder(order1.id, 'BTC/USDT:USDT');
    console.log('fetchOrder', order1_info);
    const orderbook = await exchange.fetchOrderBook('BTC/USDT:USDT');
    console.log('fetchOrderBook', orderbook);
    const withdrawResponse = await exchange.withdraw('USDT', 0.02, keys.hibachi.withdrawAddress);
    console.log(withdrawResponse);
    const myTrades = await exchange.fetchMyTrades('BTC/USDT:USDT', undefined, 1);
    console.log('fetchMyTrades', myTrades);
    const tradingFees = await exchange.fetchTradingFees();
    console.log('fetchTradingFees', tradingFees);
    const openOrders = await exchange.fetchOpenOrders();
    console.log('fetchOpenOrders', openOrders);
    const openOrdersWithLimit = await exchange.fetchOpenOrders(undefined, undefined, 1);
    console.log('fetchOpenOrdersWithLimit', openOrdersWithLimit);
    const openOrdersBTC = await exchange.fetchOpenOrders('BTC/USDT:USDT');
    console.log('fetchOpenOrdersBTC', openOrdersBTC);
    const openOrdersSince = await exchange.fetchOpenOrders(undefined, 1752552000000); // 7/15/2025 00:00 UTC
    console.log('fetchOpenOrdersSince', openOrdersSince);
    if (keys.hibachi.publicKey !== undefined) {
        const depositAddress = await exchange.fetchDepositAddress('USDT', { 'publicKey': keys.hibachi.publicKey });
        console.log('fetchDepositAddress', depositAddress);
    }
    const ledger = await exchange.fetchLedger('USDT', undefined, 2);
    console.log('fetchLedger', ledger);
    const deposits = await exchange.fetchDeposits();
    console.log('fetchDeposits', deposits);
    const withdrawals = await exchange.fetchWithdrawals();
    console.log('fetchWithdrawals', withdrawals);
    const timestamp = await exchange.fetchTime();
    console.log('fetchTime', timestamp);
    const openInterest = await exchange.fetchOpenInterest('BTC/USDT:USDT');
    console.log('fetchOpenInterest', openInterest);
    const fundingRate = await exchange.fetchFundingRate('BTC/USDT:USDT');
    console.log('fetchFundingRate', fundingRate);
    const fundingRateHistory = await exchange.fetchFundingRateHistory('BTC/USDT:USDT', undefined, 2);
    console.log('fetchFundingRateHistory', fundingRateHistory);
    // Batch orders
    const createOrders = await exchange.createOrders([
        { 'symbol': 'ETH/USDT:USDT', 'type': 'limit', 'side': 'buy', 'amount': 1.234, 'price': 1.234 },
        { 'symbol': 'BTC/USDT:USDT', 'type': 'limit', 'side': 'buy', 'amount': 1.001, 'price': 1.001 },
        { 'symbol': 'ETH/USDT:USDT', 'type': 'limit', 'side': 'buy', 'amount': 1.002, 'price': 1.002 },
        { 'symbol': 'ETH/USDT:USDT', 'type': 'limit', 'side': 'buy', 'amount': 1.003, 'price': 1.003 },
    ]);
    console.log('createOrders', createOrders);
    const editOrders = await exchange.editOrders([
        // @ts-expect-error OrderRequest lacks `id` but we expects it for editing
        { 'id': createOrders[0].id, 'symbol': 'ETH/USDT:USDT', 'type': 'limit', 'side': 'buy', 'amount': 1.111, 'price': 0.999 },
        // @ts-expect-error OrderRequest lacks `id` but we expects it for editing
        { 'id': createOrders[1].id, 'symbol': 'BTC/USDT:USDT', 'type': 'limit', 'side': 'buy', 'amount': 1.112, 'price': 0.998 },
    ]);
    console.log('editOrders', editOrders);
    const cancelOrders = await exchange.cancelOrders([createOrders[0].id, createOrders[1].id]);
    console.log('cancelOrders', cancelOrders);
    const cancelAll = await exchange.cancelAllOrders('ETH/USDT:USDT');
    console.log(cancelAll);
}
example();
 
```