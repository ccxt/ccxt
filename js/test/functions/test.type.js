'use strict'

/*  ------------------------------------------------------------------------ */

const { safeFloat, safeInteger, safeValue } = require ('../../../ccxt')
const { strictEqual: equal, deepEqual } = require ('assert')

/*  ------------------------------------------------------------------------ */

it ('safeFloat/safeInteger is robust', async () => {

    const $default = {}

    const fns = { safeFloat, safeInteger }

    for (const fn of ['safeFloat', 'safeInteger']) {

        equals (fns[fn] ({ 'x': false }, 'x', $default), $default)
        equals (fns[fn] ({ 'x': true }, 'x', $default), $default)
        equals (fns[fn] ({ 'x': [] }, 'x', $default), $default)
        equals (fns[fn] ({ 'x': [0] }, 'x', $default), $default)
        equals (fns[fn] ({ 'x': [1] }, 'x', $default), $default)
        equals (fns[fn] ({ 'x': {} }, 'x', $default), $default)
        equals (fns[fn] ({ 'x': Number.NaN }, 'x'), undefined)
        equals (fns[fn] ({ 'x': Number.POSITIVE_INFINITY }, 'x'), undefined)
        equals (fns[fn] ({ 'x': null }, 'x', undefined), undefined)
        equals (fns[fn] ({ 'x': null }, 'x', $default), $default)
        equals (fns[fn] ({ 'x': '1.0' }, 'x'), 1.0)
        equals (fns[fn] ({ 'x': '-1.0' }, 'x'), -1.0)
        equals (fns[fn] ({ 'x': 1.0 }, 'x'), 1.0)
        equals (fns[fn] ({ 'x': 0 }, 'x'), 0)
        equals (fns[fn] ({ 'x': undefined }, 'x', $default), $default)
        equals (fns[fn] ({ 'x': "" }, 'x'), undefined)
        equals (fns[fn] ({ 'x': "" }, 'x', 0), 0)
        equals (fns[fn] ({}, 'x'), undefined)
        equals (fns[fn] ({}, 'x', 0), 0)
    }

    equals (safeFloat   ({ 'x': 1.59999999 }, 'x'), 1.59999999)
    equals (safeInteger ({ 'x': 1.59999999 }, 'x'), 1)
})

/*  ------------------------------------------------------------------------ */

it ('safeValue works', () => {

    equals (safeValue ({}, 'foo'), undefined)
    equals (safeValue ({}, 'foo', 'bar'), 'bar')
    equals (safeValue ({ 'foo': 'bar' }, 'foo'), 'bar')
    equals (safeValue ({ 'foo': '' }, 'foo'), '')
    equals (safeValue ({ 'foo': 0 }, 'foo'), 0)
})

/*  ------------------------------------------------------------------------ */
