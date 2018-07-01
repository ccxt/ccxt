'use strict'

const { numberToString, decimalToPrecision, ROUND, TRUNCATE, DECIMAL_PLACES, PAD_WITH_ZERO, SIGNIFICANT_DIGITS } = require ('../../../../ccxt');
const assert = require ('assert');

// ----------------------------------------------------------------------------
// numberToString works, not supported in Python and PHP yet

// assert (numberToString (-7.9e-7) === '-0.0000007899999999999999');
// assert (numberToString ( 7.9e-7) ===  '0.0000007899999999999999');
// assert (numberToString (-12.345) === '-12.345');
// assert (numberToString ( 12.345) === '12.345');
// assert (numberToString (0) === '0');

// ----------------------------------------------------------------------------
// testDecimalToPrecisionTruncationToNDigitsAfterDot

assert (decimalToPrecision ('12.3456000', TRUNCATE, 100, DECIMAL_PLACES) === '12.3456');
assert (decimalToPrecision ('12.3456', TRUNCATE, 100, DECIMAL_PLACES) === '12.3456');
assert (decimalToPrecision ('12.3456', TRUNCATE, 4, DECIMAL_PLACES) === '12.3456');
assert (decimalToPrecision ('12.3456', TRUNCATE, 3, DECIMAL_PLACES) === '12.345');
assert (decimalToPrecision ('12.3456', TRUNCATE, 2, DECIMAL_PLACES) === '12.34');
assert (decimalToPrecision ('12.3456', TRUNCATE, 1, DECIMAL_PLACES) === '12.3');
assert (decimalToPrecision ('12.3456', TRUNCATE, 0, DECIMAL_PLACES) === '12');

// assert (decimalToPrecision ('12.3456', TRUNCATE, -1, DECIMAL_PLACES) === '10');  // not yet supported
// assert (decimalToPrecision ('123.456', TRUNCATE, -2, DECIMAL_PLACES) === '120'); // not yet supported
// assert (decimalToPrecision ('123.456', TRUNCATE, -3, DECIMAL_PLACES) === '100'); // not yet supported

assert (decimalToPrecision ('0', TRUNCATE, 0, DECIMAL_PLACES) === '0');

// ----------------------------------------------------------------------------
// testDecimalToPrecisionTruncationToNSignificantDigits

assert (decimalToPrecision ('0.000123456700', TRUNCATE, 100, SIGNIFICANT_DIGITS) === '0.0001234567');
assert (decimalToPrecision ('0.0001234567', TRUNCATE, 100, SIGNIFICANT_DIGITS) === '0.0001234567');
assert (decimalToPrecision ('0.0001234567', TRUNCATE, 7, SIGNIFICANT_DIGITS) === '0.0001234567');

assert (decimalToPrecision ('0.000123456', TRUNCATE, 6, SIGNIFICANT_DIGITS) === '0.000123456');
assert (decimalToPrecision ('0.000123456', TRUNCATE, 5, SIGNIFICANT_DIGITS) === '0.00012345');
assert (decimalToPrecision ('0.000123456', TRUNCATE, 2, SIGNIFICANT_DIGITS) === '0.00012');
assert (decimalToPrecision ('0.000123456', TRUNCATE, 1, SIGNIFICANT_DIGITS) === '0.0001');

assert (decimalToPrecision ('123.0000987654', TRUNCATE, 10, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '123.0000987');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 8, SIGNIFICANT_DIGITS) === '123.00009');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 7, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '123.0000');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 6, SIGNIFICANT_DIGITS) === '123');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 5, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '123.00');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 4, SIGNIFICANT_DIGITS) === '123');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 4, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '123.0');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 3, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '123');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 2, SIGNIFICANT_DIGITS) === '120');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 1, SIGNIFICANT_DIGITS) === '100');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 1, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '100');

assert (decimalToPrecision ('1234.69', TRUNCATE, 0, SIGNIFICANT_DIGITS) === '0');
assert (decimalToPrecision ('1234.69', TRUNCATE, 0, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '0');

// ----------------------------------------------------------------------------
// testDecimalToPrecisionRoundingToNDigitsAfterDot

assert (decimalToPrecision ('12.3456000', ROUND, 100, DECIMAL_PLACES) === '12.3456');
assert (decimalToPrecision ('12.3456', ROUND, 100, DECIMAL_PLACES) === '12.3456');
assert (decimalToPrecision ('12.3456', ROUND, 4, DECIMAL_PLACES) === '12.3456');
assert (decimalToPrecision ('12.3456', ROUND, 3, DECIMAL_PLACES) === '12.346');
assert (decimalToPrecision ('12.3456', ROUND, 2, DECIMAL_PLACES) === '12.35');
assert (decimalToPrecision ('12.3456', ROUND, 1, DECIMAL_PLACES) === '12.3');
assert (decimalToPrecision ('12.3456', ROUND, 0, DECIMAL_PLACES) === '12');

// assert (decimalToPrecision ('12.3456', ROUND, -1, DECIMAL_PLACES) === '10');   // not yet supported
// assert (decimalToPrecision ('123.456', ROUND, -1, DECIMAL_PLACES) === '120');  // not yet supported
// assert (decimalToPrecision ('123.456', ROUND, -2, DECIMAL_PLACES) === '100');  // not yet supported

assert (decimalToPrecision ('9.999', ROUND, 3, DECIMAL_PLACES) === '9.999');
assert (decimalToPrecision ('9.999', ROUND, 2, DECIMAL_PLACES) === '10');
assert (decimalToPrecision ('9.999', ROUND, 2, DECIMAL_PLACES, PAD_WITH_ZERO) === '10.00');
assert (decimalToPrecision ('99.999', ROUND, 2, DECIMAL_PLACES, PAD_WITH_ZERO) === '100.00');
assert (decimalToPrecision ('-99.999', ROUND, 2, DECIMAL_PLACES, PAD_WITH_ZERO) === '-100.00');

// ----------------------------------------------------------------------------
// testDecimalToPrecisionRoundingToNSignificantDigits

assert (decimalToPrecision ('0.000123456700', ROUND, 100, SIGNIFICANT_DIGITS) === '0.0001234567');
assert (decimalToPrecision ('0.0001234567', ROUND, 100, SIGNIFICANT_DIGITS) === '0.0001234567');
assert (decimalToPrecision ('0.0001234567', ROUND, 7, SIGNIFICANT_DIGITS) === '0.0001234567');

assert (decimalToPrecision ('0.000123456', ROUND, 6, SIGNIFICANT_DIGITS) === '0.000123456');
assert (decimalToPrecision ('0.000123456', ROUND, 5, SIGNIFICANT_DIGITS) === '0.00012346');
assert (decimalToPrecision ('0.000123456', ROUND, 4, SIGNIFICANT_DIGITS) === '0.0001235');
assert (decimalToPrecision ('0.00012', ROUND, 2, SIGNIFICANT_DIGITS) === '0.00012');
assert (decimalToPrecision ('0.0001', ROUND, 1, SIGNIFICANT_DIGITS) === '0.0001');

assert (decimalToPrecision ('123.0000987654', ROUND, 7, SIGNIFICANT_DIGITS) === '123.0001');
assert (decimalToPrecision ('123.0000987654', ROUND, 6, SIGNIFICANT_DIGITS) === '123');

assert (decimalToPrecision ('0.00098765', ROUND, 2, SIGNIFICANT_DIGITS) === '0.00099');
assert (decimalToPrecision ('0.00098765', ROUND, 2, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '0.00099');

assert (decimalToPrecision ('0.00098765', ROUND, 1, SIGNIFICANT_DIGITS) === '0.001');
assert (decimalToPrecision ('0.00098765', ROUND, 10, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '0.0009876500000');

assert (decimalToPrecision ('0.098765', ROUND, 1, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '0.1');

assert (decimalToPrecision ('0', ROUND, 0, SIGNIFICANT_DIGITS) === '0');

// ----------------------------------------------------------------------------
// testDecimalToPrecisionNegativeNumbers

assert (decimalToPrecision ('-0.123456', TRUNCATE, 5, DECIMAL_PLACES) === '-0.12345');
assert (decimalToPrecision ('-0.123456', ROUND, 5, DECIMAL_PLACES) === '-0.12346');

// ----------------------------------------------------------------------------
// decimalToPrecision: without dot / trailing dot

assert (decimalToPrecision ('123', TRUNCATE, 0) === '123');

assert (decimalToPrecision ('123', TRUNCATE, 5, DECIMAL_PLACES) === '123');
assert (decimalToPrecision ('123', TRUNCATE, 5, DECIMAL_PLACES, PAD_WITH_ZERO) === '123.00000');

assert (decimalToPrecision ('123.', TRUNCATE, 0, DECIMAL_PLACES) === '123');
assert (decimalToPrecision ('123.', TRUNCATE, 5, DECIMAL_PLACES, PAD_WITH_ZERO) === '123.00000');

assert (decimalToPrecision ('0.', TRUNCATE, 0) === '0');
assert (decimalToPrecision ('0.', TRUNCATE, 5, DECIMAL_PLACES, PAD_WITH_ZERO) === '0.00000');

// ----------------------------------------------------------------------------
// decimalToPrecision: rounding for equidistant digits

assert (decimalToPrecision ('1.44', ROUND, 1, DECIMAL_PLACES) === '1.4');
assert (decimalToPrecision ('1.45', ROUND, 1, DECIMAL_PLACES) === '1.5');
assert (decimalToPrecision ('1.45', ROUND, 0, DECIMAL_PLACES) === '1'); // not 2

// ----------------------------------------------------------------------------
// testDecimalToPrecisionErrorHandling (todo)
//
// throws (() =>
//     decimalToPrecision ('123456.789', TRUNCATE, -2, DECIMAL_PLACES),
//         'negative precision is not yet supported')
//
// throws (() =>
//     decimalToPrecision ('foo'),
//         "invalid number (contains an illegal character 'f')")
