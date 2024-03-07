

// ----------------------------------------------------------------------------

import ccxt from '../../js/ccxt.js';

// ----------------------------------------------------------------------------

(async () => {

    const exchange = new ccxt.poloniex ({
        'verbose': process.argv.includes ('--verbose'),
        'timeout': 60000,
    })

    try {

        const response = await exchange.fetchOrderBooks ([
            'ETH/BTC',
            'LTC/BTC',
            'OMG/BTC',
        ])
        console.log (response);
        console.log ('Succeeded.')

    } catch (e) {

        console.log ('--------------------------------------------------------')
        console.log (e.constructor.name, e.message)
        console.log ('--------------------------------------------------------')
        console.log (exchange.last_http_response)
        console.log ('Failed.')
    }

}) ()
