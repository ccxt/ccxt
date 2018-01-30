'use strict'

/*  ------------------------------------------------------------------------ */

global.log = require ('ololog') // for easier debugging

/*  ------------------------------------------------------------------------ */

const ccxt    = require ('../../ccxt.js')
    , assert  = require ('assert')
    , ansi    = require ('ansicolor').nice
    , chai    = require ('chai').should ()
    
/*  ------------------------------------------------------------------------ */

describe ('base/number.js works', () => {

    it ('truncate() works', () => {

        assert.equal (ccxt.truncate (0, 0), 0)
        assert.equal (ccxt.truncate (-17.56,   2), -17.56)
        assert.equal (ccxt.truncate ( 17.56,   2),  17.56)
        assert.equal (ccxt.truncate (-17.569,  2), -17.56)
        assert.equal (ccxt.truncate ( 17.569,  2),  17.56)
        assert.equal (ccxt.truncate (49.9999,  4), 49.9999)
        assert.equal (ccxt.truncate (49.99999, 4), 49.9999)
        assert.equal (ccxt.truncate (1.670006528897705e-10, 4), 0)
    })

    it ('padWithZeros (from number.js) works', () => {

        const { padWithZeroes } = require ('../base/functions/number')

        assert.strictEqual (padWithZeroes ('123.45',  -5),  '123.45')
        assert.strictEqual (padWithZeroes ('123.45',   0),  '123.45')
        assert.strictEqual (padWithZeroes ('123.45',   1),  '123.45')
        assert.strictEqual (padWithZeroes ('123',      10), '123.0000000000')
        assert.strictEqual (padWithZeroes ('123.4',    10), '123.4000000000')
        assert.strictEqual (padWithZeroes ('123.4567', 10), '123.4567000000')
    })

    it ('number.js works', () => {

        const { toPrecision, truncate, roundDecimalString } = require ('../base/functions/number')

        assert.strictEqual (roundDecimalString ('1234567890', 100), '1234567890')
        assert.strictEqual (roundDecimalString ('1234567890', 10),  '1234567890')
        assert.strictEqual (roundDecimalString ('1234567890', 8),   '1234567900')
        assert.strictEqual (roundDecimalString ('1234567890', 7),   '1234568000')
        assert.strictEqual (roundDecimalString ('1234567890', 6),   '1234570000')
        assert.strictEqual (roundDecimalString ('1234567890', 5),   '1234600000')
        assert.strictEqual (roundDecimalString ('1234567890', 4),   '1235000000')
        assert.strictEqual (roundDecimalString ('1234567890', 3),   '1230000000')
        assert.strictEqual (roundDecimalString ('1234567890', 2),   '1200000000')
        assert.strictEqual (roundDecimalString ('1234567890', 1),   '1000000000')
        assert.strictEqual (roundDecimalString ('1234567890', 0),   '0000000000')

        assert.strictEqual (roundDecimalString ('9999999999', 0),   '10000000000')
        assert.strictEqual (roundDecimalString ('9999.999999', 0),  '10000.000000')

        assert.strictEqual (roundDecimalString ('1234.567890', 7),   '1234.568000')
        assert.strictEqual (roundDecimalString ('12345.67890', 7),   '12345.68000')
        assert.strictEqual (roundDecimalString ('123456.7890', 7),   '123456.8000')
        assert.strictEqual (roundDecimalString ('1234567.890', 7),   '1234568.000')


        assert.strictEqual (roundDecimalString ('1234.567890', 2, true), '1234.570000') // after dot
        assert.strictEqual (roundDecimalString ('1234.567890', 0, true), '1235.000000') // after dot

        assert.strictEqual (toPrecision (10,   { digits: 0 }), '10')
        assert.strictEqual (toPrecision (10,   { digits: 1 }), '10.0')
        assert.strictEqual (toPrecision (10.1, { digits: 0 }), '10')
        assert.strictEqual (toPrecision (10.1, { digits: 1 }), '10.1')

        assert.strictEqual (toPrecision (10.1,          { digits: 2, round: false }), '10.10')
        assert.strictEqual (toPrecision (10.11,         { digits: 2, round: false }), '10.11')
        assert.strictEqual (toPrecision (10.199,        { digits: 2, round: false }), '10.19')
        assert.strictEqual (toPrecision (10.999999,     { digits: 8, round: false }), '10.99999900')
        assert.strictEqual (toPrecision (10.99999999,   { digits: 8, round: false }), '10.99999999')
        assert.strictEqual (toPrecision (10.9999999999, { digits: 8, round: false }), '10.99999999')

        assert.strictEqual (toPrecision (123,          { round: false, digits: 4 }), '123.0000')
        assert.strictEqual (toPrecision (123.49999999, { round: false, digits: 4 }), '123.4999')
        assert.strictEqual (toPrecision (123.49999999, { round: true,  digits: 4 }), '123.5000')
        assert.strictEqual (toPrecision (123.5,        { round: false, digits: 4 }), '123.5000')

        assert.strictEqual (toPrecision (123.49999999, { round: false, digits: 4, output: 'number' }), 123.4999)
        assert.strictEqual (toPrecision (123.49999999, { round: true,  digits: 4, output: 'number' }), 123.5)
        assert.strictEqual (toPrecision (123.5,        { round: false, digits: 4, output: 'number' }), 123.5)

        assert.strictEqual (toPrecision (123.000789, { digits: 8, fixed: false               }), '123.00079') // due to rounding
        assert.strictEqual (toPrecision (123.000789, { digits: 8, fixed: false, round: false }), '123.00078') // no rounding


        assert.strictEqual (toPrecision ('0.000000012345678', { digits: 8, fixed: false }), '0.000000012345678')
        assert.strictEqual (toPrecision ('0.000000012345678', { digits: 5, fixed: false }), '0.000000012346') // should round here
        assert.strictEqual (toPrecision ('0.000000012345678', { digits: 3, fixed: false }), '0.0000000123')
    })


})