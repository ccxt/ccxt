- [Binance Https Proxy](./examples/js/)


 ```javascript
 // AUTO-TRANSPILE //
'use strict';
import ccxt from '../../js/ccxt.js';
console.log('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member
const httpsProxyUrl = process.env.https_proxy || 'https://username:password@your-proxy.com';
const wssProxyUrl = 'same or another';
console.log('Using proxy server', httpsProxyUrl);
async function main() {
    // eslint-disable-next-line import/no-named-as-default-member
    const exchange = new ccxt.binance({
        'httpsProxy': httpsProxyUrl,
        'wssProxy': wssProxyUrl, // if wss not supported, use wsProxy
    });
    /*
    //
    // you can also use custom agent, like:
    //
    const HttpsProxyAgent = await import ('https-proxy-agent');
    const httpsAgent = new HttpsProxyAgent (httpsProxyUrl);
    const exchange = new ccxt.binance ({
        'httpsAgent': httpsAgent, // you can pass your custom agent
        'options': {
            'ws': {
                'options': { 'agent': httpsAgent },
            },
        },
    });
    */
    const symbol = 'BTC/USDT';
    await exchange.loadMarkets();
    console.log('Markets loaded');
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            const orderbook = await exchange.watchOrderBook(symbol);
            console.log(exchange.iso8601(exchange.milliseconds()), symbol, orderbook['asks'][0], orderbook['bids'][0]);
        }
        catch (e) {
            console.log(e);
        }
    }
}
main();
 
```