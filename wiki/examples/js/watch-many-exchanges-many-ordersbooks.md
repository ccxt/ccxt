- [Watch Many Exchanges Many Ordersbooks](./examples/js/)


 ```javascript
 'use strict';
import ccxt from '../../js/ccxt.js';
console.log('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member
async function watchOrderBook(exchange, symbol) {
    while (true) { // eslint-disable-line no-constant-condition
        try {
            const orderbook = await exchange.watchOrderBook(symbol);
            console.log(new Date(), exchange.id, symbol, orderbook['asks'][0], orderbook['bids'][0]);
        }
        catch (e) {
            console.log(symbol, e);
        }
    }
}
async function watchExchange(exchangeId, symbols) {
    const exchange = new ccxt.pro[exchangeId](); // eslint-disable-line import/no-named-as-default-member
    await exchange.loadMarkets();
    await Promise.all(symbols.map((symbol) => watchOrderBook(exchange, symbol)));
}
async function main() {
    const streams = {
        'binance': [
            'BTC/USDT',
            'ETH/BTC',
        ],
        'ftx': [
            'BTC/USDT',
            'ETH/BTC',
        ],
    };
    const entries = Object.entries(streams);
    await Promise.all(entries.map(([exchangeId, symbols]) => watchExchange(exchangeId, symbols)));
}
main();
 
```