- [Watch New Trades](./examples/js/)


 ```javascript
 'use strict';
import ccxt from '../../js/ccxt.js';
console.log('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member
(async () => {
    const streams = {
        'binance': 'BTC/USDT',
        'okx': 'BTC/USDT',
    };
    await Promise.all(Object.keys(streams).map((exchangeId) => (async () => {
        const exchange = new ccxt.pro[exchangeId]({
            'options': {
                'tradesLimit': 100, // lower = better, 1000 by default
            },
        });
        const symbol = streams[exchangeId];
        let lastId = '';
        while (true) { // eslint-disable-line no-constant-condition
            console.log('---');
            try {
                const trades = await exchange.watchTrades(symbol);
                for (let i = 0; i < trades.length; i++) {
                    const trade = trades[i];
                    if (trade['id'] > lastId) {
                        console.log(exchange.iso8601(exchange.milliseconds()), exchange.id, trade['symbol'], trade['id'], trade['datetime'], trade['price'], trade['amount']);
                        lastId = trade['id'];
                    }
                }
            }
            catch (e) {
                console.log(symbol, e);
            }
        }
    })()));
})();
 
```