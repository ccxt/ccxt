- [Coinex Fetch All Deposit Addresses Using Fetchdepositaddress](./examples/js/)


 ```javascript
 "use strict";

const ccxt = require ('../../ccxt')

console.log ('CCXT Version:', ccxt.version)

// https://github.com/ccxt/ccxt/issues/15405

async function main () {
    
    const exchange = new ccxt.coinex ({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_API_SECRET',
    });

    // exchange.verbose = true // uncomment for debugging purposes

    await exchange.loadMarkets ();
    const addresses = {};
    const promises = [];

    async function fetchDepositAddress (currency, network) {
        try {
            const response = await exchange.fetchDepositAddress(currency, { 'network': network });
            addresses[currency][network] = response['address']
        }
        catch (err) {
            console.error(err)
        }
    }    

    const currencies = Object.keys (exchange.currencies);

    for (const currency of currencies) {
        const networks = Object.keys (exchange.currencies[currency]['networks']);
        for (const network of networks) {
            addresses[currency] = {};
            promises.push (fetchDepositAddress (currency, network));
        }
    }

    await Promise.all (promises);

    console.log (addresses)
};

main ();
 
```