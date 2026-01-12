- [Fetch Ohlcv Many Exchanges Continuosly](./examples/ts/)


 ```javascript
 import ccxt from '../../js/ccxt.js';

// AUTO-TRANSPILE //

// fetch and handle constinuosly
async function fetchOHLCVContinuously (exchange, symbol) {
    while (true) {
        try {
            const ohlcv = await exchange.fetchOHLCV (symbol);
            const ohlcvLength = ohlcv.length;
            console.log ('Fetched ', exchange.id, ' - ', symbol, ' candles. last candle: ', ohlcv[ohlcvLength - 1]);
        } catch (e) {
            console.log (e);
            break;
        }
    }
}

// start exchanges and fetch OHLCV loop
async function startExchange (exchangeName, symbols) {
    const ex = new ccxt[exchangeName] ({});
    const promises = [];
    for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i];
        promises.push (fetchOHLCVContinuously (ex, symbol));
    }
    await Promise.all (promises);
    await ex.close ();
}

// main function
async function example () {
    const exchanges = [ 'binance', 'okx', 'kraken' ];
    const symbols = [ 'BTC/USDT', 'ETH/USDT' ];
    const promises = [];
    for (let i = 0; i < exchanges.length; i++) {
        const exchangeName = exchanges[i];
        promises.push (startExchange (exchangeName, symbols));
    }
    await Promise.all (promises);
}


await example ();
 
```