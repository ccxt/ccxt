- [Binance Universal Transfer](./examples/js/)


 ```javascript
 import ccxt from '../../js/ccxt.js';

(async () => {

    // apiKey must have universal transfer permissions
    const binance = new ccxt.binance ({
        "apiKey": "",
        "secret": "",
    })

    console.log (await binance.transfer ('USDT', 1, 'spot', 'future'))
    const transfers = await binance.fetchTransfers ();
    console.log ('got ', transfers.length, ' transfers')
    console.log (await binance.transfer ('USDT', 1, 'spot', 'cross')) // For transfer to cross margin wallet
    console.log (await binance.transfer ('USDT', 1, 'spot', 'ADA/USDT')) // For transfer to an isolated margin wallet
}) ()
 
```