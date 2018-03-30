'use strict'

/*  ------------------------------------------------------------------------ */

const { decimalToPrecision
      , ROUND
      , TRUNCATE
      , AFTER_DOT
      , PAD_WITH_ZERO
      , SIGNIFICANT_DIGITS } = require ('../../../../ccxt')

const { strictEqual: equal, throws }  = require ('assert')

/*  ------------------------------------------------------------------------ */

it ('decimalToPrecision: error handling', () => {

    throws (() =>
        equal (decimalToPrecision ('123456.789', TRUNCATE, -2, AFTER_DOT), 123500),
            'negative precision is not yet supported')

    throws (() =>
        decimalToPrecision ('foo'),
            "invalid number (contains an illegal character 'f')")
})

it ('decimalToPrecision: truncation (to N digits after dot)', () => {

    equal (decimalToPrecision ('12.3456000', TRUNCATE, 100, AFTER_DOT),  '12.3456')
    equal (decimalToPrecision ('12.3456',    TRUNCATE, 100, AFTER_DOT),  '12.3456')
    equal (decimalToPrecision ('12.3456',    TRUNCATE,   4, AFTER_DOT),  '12.3456')
    equal (decimalToPrecision ('12.3456',    TRUNCATE,   3, AFTER_DOT),  '12.345')
    equal (decimalToPrecision ('12.3456',    TRUNCATE,   2, AFTER_DOT),  '12.34')
    equal (decimalToPrecision ('12.3456',    TRUNCATE,   1, AFTER_DOT),  '12.3')
    equal (decimalToPrecision ('12.3456',    TRUNCATE,   0, AFTER_DOT),  '12')
//  equal (decimalToPrecision ('12.3456',    TRUNCATE,  -1, AFTER_DOT),  '10')   // not yet supported
//  equal (decimalToPrecision ('123.456',    TRUNCATE,  -2, AFTER_DOT),  '120')  // not yet supported
//  equal (decimalToPrecision ('123.456',    TRUNCATE,  -3, AFTER_DOT),  '100')  // not yet supported
})

it ('decimalToPrecision: truncation (to N significant digits)', () => {

    equal (decimalToPrecision ('0.000123456700', TRUNCATE, 100, SIGNIFICANT_DIGITS),  '0.0001234567')
    equal (decimalToPrecision ('0.0001234567',   TRUNCATE, 100, SIGNIFICANT_DIGITS),  '0.0001234567')
    equal (decimalToPrecision ('0.0001234567',   TRUNCATE, 7,   SIGNIFICANT_DIGITS),  '0.0001234567')

    equal (decimalToPrecision ('0.000123456',    TRUNCATE, 6,  SIGNIFICANT_DIGITS),   '0.000123456')
    equal (decimalToPrecision ('0.00012345',     TRUNCATE, 5,  SIGNIFICANT_DIGITS),   '0.00012345')
    equal (decimalToPrecision ('0.00012',        TRUNCATE, 2,  SIGNIFICANT_DIGITS),   '0.00012')
    equal (decimalToPrecision ('0.0001',         TRUNCATE, 1,  SIGNIFICANT_DIGITS),   '0.0001')

    equal (decimalToPrecision ('123.0000987654',  TRUNCATE, 10,  SIGNIFICANT_DIGITS),                '123.0000987')
    equal (decimalToPrecision ('123.0000987654',  TRUNCATE,  8,  SIGNIFICANT_DIGITS),                '123.00009')
    equal (decimalToPrecision ('123.0000987654',  TRUNCATE,  7,  SIGNIFICANT_DIGITS),                '123')
    equal (decimalToPrecision ('123.0000987654',  TRUNCATE,  7,  SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '123.0000')
    equal (decimalToPrecision ('123.0000987654',  TRUNCATE,  4,  SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '123.0')

    equal (decimalToPrecision ('123.0000987654',  TRUNCATE,  2,  SIGNIFICANT_DIGITS),                '120')
    equal (decimalToPrecision ('123.0000987654',  TRUNCATE,  1,  SIGNIFICANT_DIGITS),                '100')
    equal (decimalToPrecision ('123.0000987654',  TRUNCATE,  1,  SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '100')

})

it ('decimalToPrecision: rounding (to N digits after dot)', () => {

    equal (decimalToPrecision ('12.3456000',  ROUND, 100, AFTER_DOT),  '12.3456')
    equal (decimalToPrecision ('12.3456',     ROUND, 100, AFTER_DOT),  '12.3456')
    equal (decimalToPrecision ('12.3456',     ROUND,   4, AFTER_DOT),  '12.3456')
    equal (decimalToPrecision ('12.3456',     ROUND,   3, AFTER_DOT),  '12.346')
    equal (decimalToPrecision ('12.3456',     ROUND,   2, AFTER_DOT),  '12.35')
    equal (decimalToPrecision ('12.3456',     ROUND,   1, AFTER_DOT),  '12.3')
    equal (decimalToPrecision ('12.3456',     ROUND,   0, AFTER_DOT),  '12')
//  equal (decimalToPrecision ('12.3456',     ROUND,  -1, AFTER_DOT),  '10')  // not yet supported
//  equal (decimalToPrecision ('123.456',     ROUND,  -1, AFTER_DOT), '120')  // not yet supported
//  equal (decimalToPrecision ('123.456',     ROUND,  -2, AFTER_DOT), '100')  // not yet supported

    equal (decimalToPrecision ( '9.999',  ROUND, 3, AFTER_DOT),                 '9.999')
    equal (decimalToPrecision ( '9.999',  ROUND, 2, AFTER_DOT),                 '10')
    equal (decimalToPrecision ( '9.999',  ROUND, 2, AFTER_DOT, PAD_WITH_ZERO),  '10.00')
    equal (decimalToPrecision ( '99.999', ROUND, 2, AFTER_DOT, PAD_WITH_ZERO),  '100.00')
    equal (decimalToPrecision ('-99.999', ROUND, 2, AFTER_DOT, PAD_WITH_ZERO), '-100.00')
})

it ('decimalToPrecision: rounding (to N significant digits)', () => {

    equal (decimalToPrecision ('0.000123456700', ROUND, 100, SIGNIFICANT_DIGITS),  '0.0001234567')
    equal (decimalToPrecision ('0.0001234567',   ROUND, 100, SIGNIFICANT_DIGITS),  '0.0001234567')
    equal (decimalToPrecision ('0.0001234567',   ROUND, 7,   SIGNIFICANT_DIGITS),  '0.0001234567')

    equal (decimalToPrecision ('0.000123456',    ROUND, 6,  SIGNIFICANT_DIGITS),   '0.000123456')
    equal (decimalToPrecision ('0.000123456',    ROUND, 5,  SIGNIFICANT_DIGITS),   '0.00012346')
    equal (decimalToPrecision ('0.000123456',    ROUND, 4,  SIGNIFICANT_DIGITS),   '0.0001235')
    equal (decimalToPrecision ('0.00012',        ROUND, 2,  SIGNIFICANT_DIGITS),   '0.00012')
    equal (decimalToPrecision ('0.0001',         ROUND, 1,  SIGNIFICANT_DIGITS),   '0.0001')

    equal (decimalToPrecision ('123.0000987654', ROUND, 7,  SIGNIFICANT_DIGITS),   '123.0001')
    equal (decimalToPrecision ('123.0000987654', ROUND, 6,  SIGNIFICANT_DIGITS),   '123')

    equal (decimalToPrecision ('0.00098765', ROUND, 2,  SIGNIFICANT_DIGITS),                '0.00099')
    equal (decimalToPrecision ('0.00098765', ROUND, 2,  SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '0.00099')

    equal (decimalToPrecision ('0.00098765', ROUND, 1,   SIGNIFICANT_DIGITS),                '0.001')
    equal (decimalToPrecision ('0.00098765', ROUND, 10,  SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '0.0009876500000')

    equal (decimalToPrecision ('0.098765', ROUND, 1,  SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '0.1')
})

it ('decimalToPrecision: negative numbers', () => {

    equal (decimalToPrecision ('-0.123456', TRUNCATE, 5, AFTER_DOT), '-0.12345')
    equal (decimalToPrecision ('-0.123456', ROUND,    5, AFTER_DOT), '-0.12346')
})

it ('decimalToPrecision: without dot / trailing dot', () => {

    equal (decimalToPrecision ('123', TRUNCATE, 0), '123')

    equal (decimalToPrecision ('123', TRUNCATE, 5, AFTER_DOT),                '123')
    equal (decimalToPrecision ('123', TRUNCATE, 5, AFTER_DOT, PAD_WITH_ZERO), '123.00000')

    equal (decimalToPrecision ('123.', TRUNCATE, 0, AFTER_DOT),                '123')
    equal (decimalToPrecision ('123.', TRUNCATE, 5, AFTER_DOT, PAD_WITH_ZERO), '123.00000')
})

/*  ------------------------------------------------------------------------ */
