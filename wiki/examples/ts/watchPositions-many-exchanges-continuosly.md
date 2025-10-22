- [Watchpositions Many Exchanges Continuosly](./examples/ts/)


 ```javascript
 import ccxt from '../../js/ccxt.js';

// AUTO-TRANSPILE //

// watch and handle constinuosly
async function watchPositionsContinuously (exchange) {
    while (true) {
        try {
            const positions = await exchange.watchPositions ();
            console.log ('Fetched ', exchange.id, ' - Positions: ', positions);
        } catch (e) {
            console.log (e);
            break;
        }
    }
}

// start exchanges and fetch OHLCV loop
async function startExchange (exchangeName, config) {
    const ex = new ccxt[exchangeName] (config);
    const promises = [];
    promises.push (watchPositionsContinuously (ex));
    await Promise.all (promises);
    await ex.close ();
}

// main function
async function example () {
    const exchanges = {
        'binanceusdm': {
            'apiKey': 'YOUR_API_KEY',
            'secret': 'YOUR_API_SECRET',
        },
        'okx': {
            'apiKey': 'YOUR_API_KEY',
            'secret': 'YOUR_API_SECRET',
        },
        'huobi':{
            'apiKey': 'YOUR_API_KEY',
            'secret': 'YOUR_API_SECRET',
        },
    };
    const promises = [];
    const exchangeIds = Object.keys (exchanges);
    for (let i = 0; i < exchangeIds.length; i++) {
        const exchangeName = exchangeIds[i];
        const config = exchanges[exchangeName];
        promises.push (startExchange (exchangeName, config));
    }
    await Promise.all (promises);
}

await example ();
 
```