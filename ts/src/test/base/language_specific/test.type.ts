/*  ------------------------------------------------------------------------ */
//@ts-nocheck
/* eslint-disable */
import { functions } from '../../../../ccxt.js'
import { equal, deepEqual, ok } from 'assert'

const {
    asFloat,
    asInteger,
    safeFloat,
    safeInteger,
    safeIntegerProduct,
    safeTimestamp,
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

function testAsFloatAsInteger () {

    // numbers pass through without string coercion
    equal (asFloat (1.5), 1.5)
    equal (asFloat (0), 0)
    equal (asFloat (-0.5), -0.5)
    equal (asFloat (1e3), 1000)
    equal (asInteger (1.9), 1)
    equal (asInteger (-1.9), -1) // truncation toward zero, not floor
    equal (asInteger (0), 0)

    // non-finite numbers are rejected
    ok (Number.isNaN (asFloat (Number.POSITIVE_INFINITY)))
    ok (Number.isNaN (asFloat (Number.NaN)))
    ok (Number.isNaN (asInteger (Number.POSITIVE_INFINITY)))
    ok (Number.isNaN (asInteger (Number.NaN)))

    // strings are parsed, empty strings rejected
    equal (asFloat ('1.5'), 1.5)
    equal (asFloat ('1.5abc'), 1.5)
    equal (asFloat ('0'), 0)
    equal (asFloat ('1e3'), 1000)
    equal (asInteger ('1.9'), 1)
    equal (asInteger ('-1.9'), -1)
    equal (asInteger ('1e3'), 1000)
    ok (Number.isNaN (asFloat ('')))
    ok (Number.isNaN (asInteger ('')))

    // everything else is rejected
    ok (Number.isNaN (asFloat (true)))
    ok (Number.isNaN (asFloat (null)))
    ok (Number.isNaN (asFloat (undefined)))
    ok (Number.isNaN (asFloat ([])))
    ok (Number.isNaN (asFloat ([0])))
    ok (Number.isNaN (asInteger (true)))
    ok (Number.isNaN (asInteger (null)))
    ok (Number.isNaN (asInteger (undefined)))
    ok (Number.isNaN (asInteger ([])))
}

function testSafeTimestampSafeIntegerProduct () {

    // seconds to ms, including float seconds and negatives (truncation toward zero)
    equal (safeTimestamp ({ 'x': 1.5 }, 'x'), 1500)
    equal (safeTimestamp ({ 'x': '1.5' }, 'x'), 1500)
    equal (safeTimestamp ({ 'x': -0.9 }, 'x'), -900)
    equal (safeTimestamp ({ 'x': 1 }, 'x'), 1000)

    equal (safeIntegerProduct ({ 'x': 2.5 }, 'x', 100), 250)
    equal (safeIntegerProduct ({ 'x': '-2.5' }, 'x', 100), -250)
    equal (safeIntegerProduct ({ 'x': 1.005 }, 'x', 100), 100) // product 100.4999... truncates toward zero
    equal (safeIntegerProduct ({ 'x': -1.005 }, 'x', 100), -100)
    equal (safeIntegerProduct ({ 'x': 'abc' }, 'x', 100, 42), 42)
    equal (safeTimestamp ({ 'x': 'abc' }, 'x', 42), 42)

    // products at/above 1e21 must not go through string parsing
    // (parseInt ('1e+21') === 1; aligned with python int (float * factor) and php intval)
    equal (safeIntegerProduct ({ 'x': 1e18 }, 'x', 1000), 1e21)
    // sub-microsecond products must truncate to 0, not go through string parsing
    // (0.5 * 0.000001 = 5e-7 and parseInt ('5e-7') === 5)
    equal (safeIntegerProduct ({ 'x': 0.5 }, 'x', 0.000001), 0)
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
    testAsFloatAsInteger ()
    testSafeTimestampSafeIntegerProduct ()
    testSafeValue ()
}

export default testTypeAll;

