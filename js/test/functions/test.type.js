'use strict'

/*  ------------------------------------------------------------------------ */

const { safeFloat, safeInteger, safeValue } = require ('../../../ccxt')
const { equal, strictEqual, deepEqual } = require ('assert')

/*  ------------------------------------------------------------------------ */

it ('safeFloat/safeInteger is robust', async () => {

    const $default = {}

    const fns = { safeFloat, safeInteger }

    for (const fn of ['safeFloat', 'safeInteger']) {

        strictEqual (fns[fn] ({ 'x': false }, 'x', $default), $default)
        strictEqual (fns[fn] ({ 'x': true }, 'x', $default), $default)
        strictEqual (fns[fn] ({ 'x': [] }, 'x', $default), $default)
        strictEqual (fns[fn] ({ 'x': [0] }, 'x', $default), $default)
        strictEqual (fns[fn] ({ 'x': [1] }, 'x', $default), $default)
        strictEqual (fns[fn] ({ 'x': {} }, 'x', $default), $default)
        strictEqual (fns[fn] ({ 'x': Number.NaN }, 'x'), undefined)
        strictEqual (fns[fn] ({ 'x': Number.POSITIVE_INFINITY }, 'x'), undefined)
        strictEqual (fns[fn] ({ 'x': null }, 'x', undefined), undefined)
        strictEqual (fns[fn] ({ 'x': null }, 'x', $default), $default)
        strictEqual (fns[fn] ({ 'x': '1.0' }, 'x'), 1.0)
        strictEqual (fns[fn] ({ 'x': '-1.0' }, 'x'), -1.0)
        strictEqual (fns[fn] ({ 'x': 1.0 }, 'x'), 1.0)
        strictEqual (fns[fn] ({ 'x': 0 }, 'x'), 0)
        strictEqual (fns[fn] ({ 'x': undefined }, 'x', $default), $default)
        strictEqual (fns[fn] ({ 'x': "" }, 'x'), undefined)
        strictEqual (fns[fn] ({ 'x': "" }, 'x', 0), 0)
        strictEqual (fns[fn] ({}, 'x'), undefined)
        strictEqual (fns[fn] ({}, 'x', 0), 0)
    }

    strictEqual (safeFloat   ({ 'x': 1.59999999 }, 'x'), 1.59999999)
    strictEqual (safeInteger ({ 'x': 1.59999999 }, 'x'), 1)
})

/*  ------------------------------------------------------------------------ */

it ('safeValue works', () => {

    strictEqual (safeValue ({}, 'foo'), undefined)
    strictEqual (safeValue ({}, 'foo', 'bar'), 'bar')
    strictEqual (safeValue ({ 'foo': 'bar' }, 'foo'), 'bar')
    strictEqual (safeValue ({ 'foo': '' }, 'foo'), '')
    strictEqual (safeValue ({ 'foo': 0 }, 'foo'), 0)
})

/*  ------------------------------------------------------------------------ */
