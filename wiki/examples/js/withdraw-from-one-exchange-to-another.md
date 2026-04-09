- [Withdraw From One Exchange To Another](./examples/js/)


 ```javascript
 import ccxt from '../../js/ccxt.js';

console.log ('CCXT Version', ccxt.version)

async function main () {

    const binance = new ccxt.binance ({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        'options': {
            'fetchCurrencies': true,
        },
    })

    const kucoin = new ccxt.kucoin ({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        'password': 'YOUR_API_PASSWORD',
    })

    await binance.loadMarkets ()
    await kucoin.loadMarkets ()

    binance.verbose = true
    kucoin.verbose = true

    const code = 'COTI'
    const amount = 40

    // https://github.com/ccxt/ccxt/wiki/Manual#overriding-unified-api-params
    // https://binance-docs.github.io/apidocs/spot/en/#deposit-address-supporting-network-user_data
    const deposit = await binance.fetchDepositAddress (code, { 'network': 'ETH' })

    console.log ('-----------------------------------------------------------')

    console.log (depositAddress)

    console.log ('-----------------------------------------------------------')

    // https://github.com/ccxt/ccxt/wiki/Manual#overriding-unified-api-params
    // https://docs.kucoin.com/#apply-withdraw-2
    const withdrawal = await kucoin.withdraw (code, amount, deposit['address'], deposit['tag'], { 'chain': 'ERC20' })

    console.log ('-----------------------------------------------------------')

    console.log (withdrawal)

}

main ()
 
```