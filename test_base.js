/*  ------------------------------------------------------------------------ */

const ccxtFile = './ccxt.js' //process.argv.includes ('--es6') ? './ccxt.js' : './build/ccxt.es5.js'
    , ccxt     = require (ccxtFile)
    , assert   = require ('assert')
    , log      = require ('ololog')
    , ansi     = require ('ansicolor').nice;

/*  ------------------------------------------------------------------------ */

describe ('ccxt base code', () => {

    it ('sleep() is robust', async () => {
        
        for (let i = 0; i < 30; i++) {
            const before = Date.now ()
            await ccxt.sleep (10)
            const now = Date.now ()
            assert ((now - before) >= 10) // not too fast
            assert ((now - before) < 20)  // but not too slow...
        }
    })
})

/*  ------------------------------------------------------------------------ */
