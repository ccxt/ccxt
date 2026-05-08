- [Okx Poll Rate Limit](./examples/js/)


 ```javascript
 import ccxt from '../../js/ccxt.js'

console.log ('CCXT Version:', ccxt.version)

async function main () {

    const exchange = new ccxt.okx ({

        // edit for your credentials
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_API_SECRET',
        'password': 'YOUR_API_PASSWORD',

        'api': {
            'private': {
                'get': {
                    'trade/fills-history': 2.2,
                },
            },
        },

    })

    await exchange.loadMarkets ()

    // if this script fails with a rate limiter error
    // uncomment the following line for debugging purposes

    // exchange.verbose = true

    const promises=[];
    for(let i=0;i<100;i++){
        promises.push(exchange.fetchMyTrades());
    }

    const allResponses = await Promise.allSettled(promises);
    allResponses.forEach((result, i) => {

        if(result.status == "fulfilled"){
            console.log (new Date(), i + 6, 'fetched', result.value.length, 'trades')
        } else {
            console.log ("Rejected:", i + 6, result.reason);
        }
    });

}

main ()
 
```