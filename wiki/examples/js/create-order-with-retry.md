- [Create Order With Retry](./examples/js/)


 ```javascript
 

import ccxt from '../../js/ccxt.js';

// ----------------------------------------------------------------------------

const tryToCreateOrder = async function (exchange, symbol, type, side, amount, price, params) {

    try {

        const order = await exchange.createOrder (symbol, type, side, amount, price, params)
        return order

    } catch (e) {

        console.log (e.constructor.name, e.message)

        if (e instanceof ccxt.NetworkError) {

            // retry on networking errors
            return false

        } else {

            throw e // break on all other exceptions
        }
    }
}

// ----------------------------------------------------------------------------

const exchange = new ccxt.bytetrade ({
    'apiKey': 'classic123', // edit here
    'secret': 'ebcefff7de475ffe15e864ca3e3e410edf7e94fffd1f9af34edf9434e2bfff1b',  // edit here
})

//
// make a classic bytetrade account - one that is linked to an email or phone number
// then click on your username in the top right and then export
// you will get a file like this:
//
// future garage icon motion panda garage motion task science head garage notable
// ebcefff7de475ffe15e864ca3e3e410edf7e94fffd1f9af34edf9434e2bfff1b
// classic123
//
// the second line is your secret and the third line is your apiKey
//

const symbol = 'XRP/USDT' // edit here
const type = 'limit '     // edit here
const side = 'buy'        // edit here
const amount = 10         // edit here
const price = 1           // edit here
const params = {}         // edit here

;(async () => {
    let order = false
    while (true) {
        order = await tryToCreateOrder (exchange, symbol, type, side, amount, price, params)
        if (order !== false) {
            break
        }
    }
    console.log (order)
}) ()
 
```