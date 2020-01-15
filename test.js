'use strict';

const ccxtpro = require ('./ccxt.pro.js')

;(async () => {

    const id = 'gateio'
        , symbol = 'ETH/BTC'
        , enableRateLimit = true
        , exchange = new ccxtpro[id] ({"apiKey":"C294CF44-BD3D-4D9A-BE27-B288756232A8","secret":"6da6bd0d20b8179dd84a67e9a814b8b6efd4c53205d0d0dafdee5b3ac7fc9ce7", enableRateLimit: true})

    while (true) {
        try {
            const response = await exchange.watchOrders ()
            console.log (response)
        } catch (e) {
            console.log (new Date (), e)
            await ccxtpro.sleep (1000)
        }
    }
}) ()
