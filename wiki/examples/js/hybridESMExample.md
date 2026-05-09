- [Hybridesmexample](./examples/js/)


 ```javascript
 import {version, huobi} from 'ccxt';

console.log('--------------------------------------------')
console.log('Yey importing ccxt as an ESM module!!!!!')
console.log('Version:', version)
console.log('--------------------------------------------')

const exchange = new huobi ({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET_KEY',
    'options': {
        'defaultType': 'swap',
    },
})

;(async () => {
    const result = await exchange.fetchBalance();
    console.log(result)
    }) () 
```