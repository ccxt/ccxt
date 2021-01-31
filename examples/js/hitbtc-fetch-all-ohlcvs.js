"use strict";

const ccxt = require ('../../ccxt')

const exchange = new ccxt.hitbtc ({
    'enableRateLimit': true,
})

;(async () => {

    await exchange.loadMarkets ()

    // start from february 2020
    const start = exchange.parse8601 ('2020-02-01T00:00:00Z')
    const timeframe = '1m'
    // get the duration of one timeframe period in milliseconds
    const duration = exchange.parseTimeframe (timeframe) * 1000

    for (const symbol of exchange.symbols) {

        console.log ('-------------------------------------------------------')
        console.log ('Fetching', symbol, timeframe, 'candles')

        let since = start

        do {

            try {
                const candles = await exchange.fetchOHLCV (symbol, timeframe, since)

                if (candles.length) {

                    const first = candles[0]
                    const last = candles[candles.length - 1]

                    console.log (
                        'Fetched', candles.length, symbol, timeframe, 'candles',
                        'from', exchange.iso8601 (first[0]),
                        'to', exchange.iso8601 (last[0])
                    )

                    // store your candles to a database or to a file here
                    // ...

                    since = last[0] + duration // next start from last candle timestamp + duration

                } else {

                    console.log ('Fetched', candles.length, symbol, 'candles')
                    break
                }

            } catch (e) {

                console.log (e.constructor.name, e.constructor.message)
                // retry on next iteration
            }

        } while (since < exchange.milliseconds ())
    }

}) ()
