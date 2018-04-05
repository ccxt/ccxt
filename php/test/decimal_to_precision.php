<?php

include_once ('ccxt.php');

use ccxt\Exchange;
use const ccxt\DECIMAL_PLACES;
use const ccxt\NO_PADDING;
use const ccxt\PAD_WITH_ZERO;
use const ccxt\ROUND;
use const ccxt\SIGNIFICANT_DIGITS;
use const ccxt\TRUNCATE;

//-----------------------------------------------------------------------------
// testDecimalToPrecisionErrorHandling
//
// $this->expectException ('ccxt\\BaseError');
// $this->expectExceptionMessageRegExp ('/Negative precision is not yet supported/');
// Exchange::decimalToPrecision ('123456.789', TRUNCATE, -2, DECIMAL_PLACES);
//
// $this->expectException ('ccxt\\BaseError');
// $this->expectExceptionMessageRegExp ('/Invalid number/');
// Exchange::decimalToPrecision ('foo');

//-----------------------------------------------------------------------------
// testDecimalToPrecisionTruncationToNDigitsAfterDot

assert (Exchange::decimal_to_precision ('12.3456000', TRUNCATE, 100, DECIMAL_PLACES) === '12.3456');
assert (Exchange::decimal_to_precision ('12.3456',    TRUNCATE, 100, DECIMAL_PLACES) === '12.3456');
assert (Exchange::decimal_to_precision ('12.3456',    TRUNCATE,   4, DECIMAL_PLACES) === '12.3456');
assert (Exchange::decimal_to_precision ('12.3456',    TRUNCATE,   3, DECIMAL_PLACES) === '12.345');
assert (Exchange::decimal_to_precision ('12.3456',    TRUNCATE,   2, DECIMAL_PLACES) === '12.34');
assert (Exchange::decimal_to_precision ('12.3456',    TRUNCATE,   1, DECIMAL_PLACES) === '12.3');
assert (Exchange::decimal_to_precision ('12.3456',    TRUNCATE,   0, DECIMAL_PLACES) === '12');

// assert (Exchange::decimal_to_precision ('12.3456',    TRUNCATE,  -1, DECIMAL_PLACES) === '10');  // not supported yet
// assert (Exchange::decimal_to_precision ('123.456',    TRUNCATE,  -2, DECIMAL_PLACES) === '120'); // not supported yet
// assert (Exchange::decimal_to_precision ('123.456',    TRUNCATE,  -3, DECIMAL_PLACES) === '100'); // not supported yet

//-----------------------------------------------------------------------------
// testDecimalToPrecisionTruncationToNSignificantDigits

assert (Exchange::decimal_to_precision ('0.000123456700', TRUNCATE, 100, SIGNIFICANT_DIGITS,    NO_PADDING) === '0.0001234567');
assert (Exchange::decimal_to_precision ('0.0001234567',   TRUNCATE, 100, SIGNIFICANT_DIGITS,    NO_PADDING) === '0.0001234567');
assert (Exchange::decimal_to_precision ('0.0001234567',   TRUNCATE,   7, SIGNIFICANT_DIGITS,    NO_PADDING) === '0.0001234567');

assert (Exchange::decimal_to_precision ('0.000123456',    TRUNCATE,   6, SIGNIFICANT_DIGITS,    NO_PADDING) === '0.000123456');
assert (Exchange::decimal_to_precision ('0.00012345',     TRUNCATE,   5, SIGNIFICANT_DIGITS,    NO_PADDING) === '0.00012345');
assert (Exchange::decimal_to_precision ('0.00012',        TRUNCATE,   2, SIGNIFICANT_DIGITS,    NO_PADDING) === '0.00012');
assert (Exchange::decimal_to_precision ('0.0001',         TRUNCATE,   1, SIGNIFICANT_DIGITS,    NO_PADDING) === '0.0001');

assert (Exchange::decimal_to_precision ('123.0000987654', TRUNCATE,  10, SIGNIFICANT_DIGITS,    NO_PADDING) === '123.0000987');
assert (Exchange::decimal_to_precision ('123.0000987654', TRUNCATE,   8, SIGNIFICANT_DIGITS,    NO_PADDING) === '123.00009');
assert (Exchange::decimal_to_precision ('123.0000987654', TRUNCATE,   7, SIGNIFICANT_DIGITS,    NO_PADDING) === '123');
assert (Exchange::decimal_to_precision ('123.0000987654', TRUNCATE,   7, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '123.0000');
assert (Exchange::decimal_to_precision ('123.0000987654', TRUNCATE,   4, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '123.0');

assert (Exchange::decimal_to_precision ('123.0000987654', TRUNCATE,   2, SIGNIFICANT_DIGITS,    NO_PADDING) === '120');
assert (Exchange::decimal_to_precision ('123.0000987654', TRUNCATE,   1, SIGNIFICANT_DIGITS,    NO_PADDING) === '100');
assert (Exchange::decimal_to_precision ('123.0000987654', TRUNCATE,   1, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '100');

//-----------------------------------------------------------------------------
// testDecimalToPrecisionRoundingToNDigitsAfterDot

assert (Exchange::decimal_to_precision ('12.3456000', ROUND, 100, DECIMAL_PLACES,    NO_PADDING) === '12.3456');
assert (Exchange::decimal_to_precision ('12.3456',    ROUND, 100, DECIMAL_PLACES,    NO_PADDING) === '12.3456');
assert (Exchange::decimal_to_precision ('12.3456',    ROUND,   4, DECIMAL_PLACES,    NO_PADDING) === '12.3456');
assert (Exchange::decimal_to_precision ('12.3456',    ROUND,   3, DECIMAL_PLACES,    NO_PADDING) === '12.346');
assert (Exchange::decimal_to_precision ('12.3456',    ROUND,   2, DECIMAL_PLACES,    NO_PADDING) === '12.35');
assert (Exchange::decimal_to_precision ('12.3456',    ROUND,   1, DECIMAL_PLACES,    NO_PADDING) === '12.3');
assert (Exchange::decimal_to_precision ('12.3456',    ROUND,   0, DECIMAL_PLACES,    NO_PADDING) === '12');

// assert (Exchange::decimal_to_precision ('12.3456',    ROUND,  -1, DECIMAL_PLACES,    NO_PADDING,  '10');  // not supported yet
// assert (Exchange::decimal_to_precision ('123.456',    ROUND,  -1, DECIMAL_PLACES,    NO_PADDING,  '120'); // not supported yet
// assert (Exchange::decimal_to_precision ('123.456',    ROUND,  -2, DECIMAL_PLACES,    NO_PADDING,  '100'); // not supported yet

assert (Exchange::decimal_to_precision ('9.999',     ROUND,   3, DECIMAL_PLACES,    NO_PADDING) === '9.999');
assert (Exchange::decimal_to_precision ('9.999',     ROUND,   2, DECIMAL_PLACES,    NO_PADDING) === '10');
assert (Exchange::decimal_to_precision ('9.999',     ROUND,   2, DECIMAL_PLACES, PAD_WITH_ZERO) === '10.00');
assert (Exchange::decimal_to_precision ('99.999',    ROUND,   2, DECIMAL_PLACES, PAD_WITH_ZERO) === '100.00');
assert (Exchange::decimal_to_precision ('-99.999',   ROUND,   2, DECIMAL_PLACES, PAD_WITH_ZERO) === '-100.00');

//-----------------------------------------------------------------------------
// testDecimalToPrecisionRoundingToNSignificantDigits

assert (Exchange::decimal_to_precision ('0.000123456700', ROUND, 100, SIGNIFICANT_DIGITS,    NO_PADDING) === '0.0001234567');
assert (Exchange::decimal_to_precision ('0.0001234567',   ROUND, 100, SIGNIFICANT_DIGITS,    NO_PADDING) === '0.0001234567');
assert (Exchange::decimal_to_precision ('0.0001234567',   ROUND,   7, SIGNIFICANT_DIGITS,    NO_PADDING) === '0.0001234567');

assert (Exchange::decimal_to_precision ('0.000123456',    ROUND,   6, SIGNIFICANT_DIGITS,    NO_PADDING) === '0.000123456');
assert (Exchange::decimal_to_precision ('0.000123456',    ROUND,   5, SIGNIFICANT_DIGITS,    NO_PADDING) === '0.00012346');
assert (Exchange::decimal_to_precision ('0.000123456',    ROUND,   4, SIGNIFICANT_DIGITS,    NO_PADDING) === '0.0001235');
assert (Exchange::decimal_to_precision ('0.00012',        ROUND,   2, SIGNIFICANT_DIGITS,    NO_PADDING) === '0.00012');
assert (Exchange::decimal_to_precision ('0.0001',         ROUND,   1, SIGNIFICANT_DIGITS,    NO_PADDING) === '0.0001');

assert (Exchange::decimal_to_precision ('123.0000987654', ROUND,   7, SIGNIFICANT_DIGITS,    NO_PADDING) === '123.0001');
assert (Exchange::decimal_to_precision ('123.0000987654', ROUND,   6, SIGNIFICANT_DIGITS,    NO_PADDING) === '123');

assert (Exchange::decimal_to_precision ('0.00098765',     ROUND,   2, SIGNIFICANT_DIGITS,    NO_PADDING) === '0.00099');
assert (Exchange::decimal_to_precision ('0.00098765',     ROUND,   2, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '0.00099');

assert (Exchange::decimal_to_precision ('0.00098765',     ROUND,   1, SIGNIFICANT_DIGITS,    NO_PADDING) === '0.001');
assert (Exchange::decimal_to_precision ('0.00098765',     ROUND,  10, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '0.0009876500000');

assert (Exchange::decimal_to_precision ('0.098765',       ROUND,   1, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '0.1');

//-----------------------------------------------------------------------------
// testDecimalToPrecisionNegativeNumbers

assert (Exchange::decimal_to_precision ('-0.123456', TRUNCATE, 5, DECIMAL_PLACES) === '-0.12345');
assert (Exchange::decimal_to_precision ('-0.123456', ROUND,    5, DECIMAL_PLACES) === '-0.12346');

