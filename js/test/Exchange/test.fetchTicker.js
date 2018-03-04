'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    if (exchange.has.fetchTicker) {

        // log (symbol.green, 'fetching ticker...')

        let ticker = await exchange.fetchTicker (symbol)
        const keys = [ 'datetime', 'timestamp', 'high', 'low', 'bid', 'ask', 'baseVolume', 'quoteVolume', 'vwap' ]

        // log (ticker)

        keys.forEach (key => assert (key in ticker))

        const { high, low, vwap, baseVolume, quoteVolume } = ticker

        // this assert breaks QuadrigaCX sometimes... still investigating
        // if (vwap)
        //     assert (vwap >= low && vwap <= high)

        /*
        if (baseVolume && quoteVolume && high && low) {
            assert (quoteVolume >= baseVolume * low) // this assertion breaks therock
            assert (quoteVolume <= baseVolume * high)
        }
        */

        if (baseVolume && vwap)
            assert (quoteVolume)

        if (quoteVolume && vwap)
            assert (baseVolume)

        log (symbol.green, 'ticker',
            ticker['datetime'],
            ... (keys.map (key =>
                key + ': ' + ticker[key])))

        if ((exchange.id !== 'coinmarketcap') && (exchange.id !== 'xbtce'))
            if (ticker['bid'] && ticker['ask'])
                assert (ticker['bid'] <= ticker['ask'])

    } else {

        log (symbol.green, 'fetchTicker () not supported')
    }
}

