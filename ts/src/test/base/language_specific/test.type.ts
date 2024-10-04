/*  ------------------------------------------------------------------------ */
<<<<<<<< HEAD:ts/src/test/base/custom/test.type.ts

========
//@ts-nocheck
/* eslint-disable */
import { functions } from '../../../../ccxt.js'
>>>>>>>> 4eeb60265bc3efc96d365637aa4fb384e2169bab:ts/src/test/base/language_specific/test.type.ts
import { equal, deepEqual } from 'assert'
import { functions } from '../../../../ccxt.js'

const {
    safeFloat,
    safeInteger,
    safeValue
} = functions;
/*  ------------------------------------------------------------------------ */

function testSafeFloatSafeInteger() {

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
}

function testSafeValue() {

    equal (safeValue ({}, 'foo'), undefined)
    equal (safeValue ({}, 'foo', 'bar'), 'bar')
    equal (safeValue ({ 'foo': 'bar' }, 'foo'), 'bar')
    equal (safeValue ({ 'foo': '' }, 'foo'), undefined)
    equal (safeValue ({ 'foo': 0 }, 'foo'), 0)
}

function testTypeAll () {
    testSafeFloatSafeInteger ()
    testSafeValue ()
}

export default testTypeAll;

