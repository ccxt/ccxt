'use strict'

/*  ------------------------------------------------------------------------ */

const { safeFloat, safeInteger, safeValue } = require ('../../../../ccxt')
const { strictEqual: equal, deepEqual } = require ('assert')

/*  ------------------------------------------------------------------------ */

it ('safeFloat/safeInteger is robust', async () => {

    const $default = {}

    const fns = { safeFloat, safeInteger }

    for (const fn of ['safeFloat', 'safeInteger']) {

        equal (fns[fn] ({ 'x': false }, 'x', $default), $default)
        equal (fns[fn] ({ 'x': true }, 'x', $default), $default)
        equal (fns[fn] ({ 'x': [] }, 'x', $default), $default)
        equal (fns[fn] ({ 'x': [0] }, 'x', $default), $default)
        equal (fns[fn] ({ 'x': [1] }, 'x', $default), $default)
        equal (fns[fn] ({ 'x': {} }, 'x', $default), $default)
        equal (fns[fn] ({ 'x': Number.NaN }, 'x'), undefined)
        equal (fns[fn] ({ 'x': Number.POSITIVE_INFINITY }, 'x'), undefined)
        equal (fns[fn] ({ 'x': null }, 'x', undefined), undefined)
        equal (fns[fn] ({ 'x': null }, 'x', $default), $default)
        equal (fns[fn] ({ 'x': '1.0' }, 'x'), 1.0)
        equal (fns[fn] ({ 'x': '-1.0' }, 'x'), -1.0)
        equal (fns[fn] ({ 'x': 1.0 }, 'x'), 1.0)
        equal (fns[fn] ({ 'x': 0 }, 'x'), 0)
        equal (fns[fn] ({ 'x': undefined }, 'x', $default), $default)
        equal (fns[fn] ({ 'x': "" }, 'x'), undefined)
        equal (fns[fn] ({ 'x': "" }, 'x', 0), 0)
        equal (fns[fn] ({}, 'x'), undefined)
        equal (fns[fn] ({}, 'x', 0), 0)
    }

    equal (safeFloat   ({ 'x': 1.59999999 }, 'x'), 1.59999999)
    equal (safeInteger ({ 'x': 1.59999999 }, 'x'), 1)
})

/*  ------------------------------------------------------------------------ */

it ('safeValue works', () => {

    equal (safeValue ({}, 'foo'), undefined)
    equal (safeValue ({}, 'foo', 'bar'), 'bar')
    equal (safeValue ({ 'foo': 'bar' }, 'foo'), 'bar')
    equal (safeValue ({ 'foo': '' }, 'foo'), '')
    equal (safeValue ({ 'foo': 0 }, 'foo'), 0)
})

/*  ------------------------------------------------------------------------ */
