'use strict'

/*  ------------------------------------------------------------------------ */

global.log = require ('ololog') // for easier debugging

/*  ------------------------------------------------------------------------ */

const ccxt     = require ('../../ccxt.js')
    , assert   = require ('assert')
    , ansi     = require ('ansicolor').nice
    , chai     = require ('chai').should ()

/*  ------------------------------------------------------------------------ */

describe ('base/type.js works', () => {


    it ('safeFloat/safeInteger is robust', async () => {

        const $default = {}

        for (const fn of ['safeFloat', 'safeInteger']) {

            log (fn, ccxt.safeFloat ({ float: [0] }, 'float'))

            assert.strictEqual (ccxt[fn] ({'x': false }, 'x', $default), $default)
            assert.strictEqual (ccxt[fn] ({'x': true }, 'x', $default), $default)
            assert.strictEqual (ccxt[fn] ({'x': [] }, 'x', $default), $default)
            assert.strictEqual (ccxt[fn] ({'x': [0] }, 'x', $default), $default)
            assert.strictEqual (ccxt[fn] ({'x': [1] }, 'x', $default), $default)
            assert.strictEqual (ccxt[fn] ({'x': {} }, 'x', $default), $default)
            assert.strictEqual (ccxt[fn] ({'x': Number.NaN }, 'x'), undefined)
            assert.strictEqual (ccxt[fn] ({'x': Number.POSITIVE_INFINITY }, 'x'), undefined)
            assert.strictEqual (ccxt[fn] ({'x': null }, 'x', undefined), undefined)
            assert.strictEqual (ccxt[fn] ({'x': null }, 'x', $default), $default)
            assert.strictEqual (ccxt[fn] ({'x': '1.0'}, 'x'), 1.0)
            assert.strictEqual (ccxt[fn] ({'x': '-1.0'}, 'x'), -1.0)
            assert.strictEqual (ccxt[fn] ({'x': 1.0}, 'x'), 1.0)
            assert.strictEqual (ccxt[fn] ({'x': 0}, 'x'), 0)
            assert.strictEqual (ccxt[fn] ({'x': undefined}, 'x', $default), $default)
            assert.strictEqual (ccxt[fn] ({'x': ""}, 'x'), undefined)
            assert.strictEqual (ccxt[fn] ({'x': ""}, 'x', 0), 0)
            assert.strictEqual (ccxt[fn] ({}, 'x'), undefined)
            assert.strictEqual (ccxt[fn] ({}, 'x', 0), 0)
        }

        assert.strictEqual (ccxt.safeFloat ({'x': 1.59999999}, 'x'), 1.59999999)
        assert.strictEqual (ccxt.safeInteger ({'x': 1.59999999}, 'x'), 1)
    })

    it ('safeValue works', () => {

        assert.strictEqual (safeValue ({}, 'foo'), undefined)
        assert.strictEqual (safeValue ({}, 'foo', 'bar'), 'bar')
        assert.strictEqual (safeValue ({ 'foo': 'bar' }, 'foo'), 'bar')
        assert.strictEqual (safeValue ({ 'foo': '' }, 'foo'), '')
        assert.strictEqual (safeValue ({ 'foo': 0 }, 'foo'), 0)
    })
})