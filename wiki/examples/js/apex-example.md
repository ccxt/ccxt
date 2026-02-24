- [Apex Example](./examples/js/)


 ```javascript
 import ccxt from '../../js/ccxt.js';
// AUTO-TRANSPILE //
async function example() {
    const exchange = new ccxt.apex({
        'apiKey': 'your api Key',
        'secret': 'your api secret',
        'walletAddress': 'your eth address',
        'options': {
            'accountId': 'your account id',
            'passphrase': 'your api passphrase',
            'seeds': 'your zklink omni seed',
            'brokerId': '',
        },
    });
    exchange.setSandboxMode (true)
    const fetchTime = await exchange.fetchTime();
    console.log(fetchTime);
    //const transfer = await exchange.transfer('USDT', 1.1);
    //console.log(transfer);
    //const transferFromContract = await exchange.transfer('USDT', 1.2, 'contract', 'spot');
    //console.log(transferFromContract);
    //const fetchCurrencies = await exchange.fetchCurrencies();
    //console.log(fetchCurrencies);
    //const fetchBalance = await exchange.fetchBalance();
    //console.log(fetchBalance);
    //const fetchMarkets = await exchange.fetchMarkets();
    //console.log(fetchMarkets);
    //const fetchTicker = await exchange.fetchTicker('BTC-USDT');
    //console.log(fetchTicker);
    //const fetchTickers = await exchange.fetchTickers();
    //console.log(fetchTickers);
    //const fetchTrades = await exchange.fetchTrades('BTC-USDT');
    //console.log(fetchTrades);
    //const fetchOHLCV = await exchange.fetchOHLCV('BTC-USDT','1m', undefined, 200);
    //console.log(fetchOHLCV);
    //const fechOrderBook = await exchange.fetchOrderBook('BTC-USDT');
    //console.log(fechOrderBook);
    //const fetchOpenInterest = await exchange.fetchOpenInterest('BTC-USDT');
    //console.log(fetchOpenInterest);

    //const fetchTransfers = await exchange.fetchTransfers();
    //console.log(fetchTransfers);
    //const fetchTransfer = await exchange.fetchTransfer();
    //console.log(fetchTransfer);

    //const createOrderRes1 = await exchange.createOrder('BTC-USDT', 'LIMIT', 'SELL', 0.001, 100000, {'reduceOnly':true});
    //console.log(createOrderRes1);
    const createOrderRes1 = await exchange.createOrder('BTC-USDT', 'STOP_LIMIT', 'BUY', 0.001, 100000, {'triggerPriceType':'INDEX', 'triggerPrice':'10100'});
    console.log(createOrderRes1);

    const fetchOpenOrders = await exchange.fetchOpenOrders();
    console.log(fetchOpenOrders);
    //const fetchOpenOrder = await exchange.fetchOrder(undefined,undefined,{"clientOrderId":'apexomni-615910568987983964-1741322302826-253839'});
    //console.log(fetchOpenOrder);
    //const cancelOrder = await exchange.cancelOrder('685707935650677596');
    //console.log(cancelOrder);
    //const cancelOrder1 = await exchange.cancelOrder(undefined,undefined,{"clientOrderId":'apexomni-615910568987983964-1741324574601-908656'});
    //console.log(cancelOrder1);
    //const cancelAllOrders = await exchange.cancelAllOrders();
    //console.log(cancelAllOrders);

    //const setLeverage = await exchange.setLeverage(5,'BTC-USDT');
    //console.log(setLeverage);

    //const fetchPositions = await exchange.fetchPositions();
    //console.log(fetchPositions);

    //const fetchOrder = await exchange.fetchOrder('685781264227107164');
    //console.log(fetchOrder);

    //const fetchOrderTrades = await exchange.fetchOrderTrades('685781264227107164'); //{"clientOrderId":'apexomni-615910568987983964-1741339789276-640091'}
    //console.log(fetchOrderTrades);


    let since = exchange.milliseconds () - 86400000*1; // -1 day from now
    let allTrades = [];
    let page = 0;
    while (since < exchange.milliseconds ()) {
        const params = {
            'page': page, // exchange-specific non-unified parameter name
        }
        const trades = await exchange.fetchFundingHistory ('BTC-USDT', since, 20, params)
        if (trades.length) {
            allTrades = allTrades.concat (trades)
            page++
        } else {
            break
        }
    }
    allTrades = exchange.sortBy(allTrades, 'timestamp');


    const createOrderRes = await exchange.createOrder('BTC-USDT', 'LIMIT', 'BUY', 0.001, 70000, {'reduceOnly':true,'postOnly':true});
    console.log(createOrderRes);
    console.log('end');
}
await example();
 
```