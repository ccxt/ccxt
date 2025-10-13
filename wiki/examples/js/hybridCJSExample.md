- [Hybridcjsexample](./examples/js/)


 ```javascript
 
const ccxt = require('ccxt');

console.log('--------------------------------------------')
console.log('Yey importing ccxt as a cjs module!!!!!')
console.log('Version:', ccxt.version)
console.log('--------------------------------------------')

const exchange = new ccxt.huobi ({
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