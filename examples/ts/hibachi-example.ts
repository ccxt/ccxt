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
            "withdrawAddress": "0x1111111111111111111111111111111111111111"
        }
    }
    ```
    You can get the accountId, apiKey and privateKey from Hibachi App by creating an API key
    Note: if you are using exchange managed account, the privateKey's length will be 44 instead
    The withdrawAddress can be any ethereum wallet address, that is used to receive funds for withdraw tests
*/
async function example () {
    const keys = JSON.parse(fs.readFileSync('keys.local.json', 'utf-8'));
    const exchange = new hibachi (keys.hibachi);
    exchange.verbose = true;

    const markets = await exchange.fetchMarkets();
    console.log ('fetchMarkets', markets.length, markets[0]);

    const currencies = await exchange.fetchCurrencies();
    console.dir (currencies, { depth: null, colors: true });

    const trades = await exchange.fetchTrades("BTC/USDT:USDT");
    console.log('fetchTrades', trades.length, trades[0]);

    const balance = await exchange.fetchBalance();
    console.dir (balance, { depth: null, colors: true });

    const ticker = await exchange.fetchTicker('BTC/USDT:USDT');
    console.log ('fetchTicker', ticker);

    // createOrder, editOrder and cancelOrder
    const order1 = await exchange.createOrder('BTC/USDT:USDT', 'market', 'buy', 0.00002);
    const order2 = await exchange.createOrder('BTC/USDT:USDT', 'market', 'sell', 0.00002);
    console.log('create market order', order1.id, order2.id);
    const order3 = await exchange.createOrder('ETH/USDT:USDT', 'limit', 'buy', 1.234, 1.234);
    const order4 = await exchange.editOrder(order3.id, 'ETH/USDT:USDT', 'limit', 'buy', 0.987, 1.123);
    const order5 = await exchange.cancelOrder(order3.id);
    console.log('create, edit and cancel limit order', order3.id, order4.id, order5.id);
    
    const orderbook = await exchange.fetchOrderBook ('BTC/USDT:USDT');
    console.log ('fetchOrderBook', orderbook);

    const withdrawResponse = await exchange.withdraw('USDT', 0.02, keys.hibachi.withdrawAddress);
    console.log(withdrawResponse);

    const myTrades = await exchange.fetchMyTrades('BTC/USDT:USDT', undefined, 1);
    console.log('fetchMyTrades', myTrades);

    const tradingFees = await exchange.fetchTradingFees ();
    console.log ('fetchTradingFees', tradingFees);

    const depositAddress = await exchange.fetchDepositAddress ('USDT');
    console.log ('fetchDepositAddress', depositAddress);
}
example ();
