//'use strict'

const { numberToString, decimalToPrecision, ROUND, TRUNCATE, DECIMAL_PLACES, TICK_SIZE, NO_PADDING, PAD_WITH_ZERO, SIGNIFICANT_DIGITS } = require ('../../../../ccxt');
const Precise = require ('../../../base/Precise')
const assert = require ('assert');
const { performance } = require('perf_hooks');

function testPrecise () {
	// ----------------------------------------------------------------------------
	
	const w = '-1.123e-6';
	const x = '0.00000002';
	const y = '69696900000';
	const z = '0';
	const a = '1e8';
	
	assert (Precise.stringMul (x, y) === '1393.938');
	assert (Precise.stringMul (y, x) === '1393.938');
	assert (Precise.stringAdd (x, y) === '69696900000.00000002');
	assert (Precise.stringAdd (y, x) === '69696900000.00000002');
	assert (Precise.stringSub (x, y) === '-69696899999.99999998');
	assert (Precise.stringSub (y, x) === '69696899999.99999998');
	assert (Precise.stringDiv (x, y, 1) === '0');
	assert (Precise.stringDiv (x, y) === '0');
	assert (Precise.stringDiv (x, y, 19) === '0.0000000000000000002');
	assert (Precise.stringDiv (x, y, 20) === '0.00000000000000000028');
	assert (Precise.stringDiv (x, y, 21) === '0.000000000000000000286');
	assert (Precise.stringDiv (x, y, 22) === '0.0000000000000000002869');
	assert (Precise.stringDiv (y, x) === '3484845000000000000');
	
	assert (Precise.stringMul (x, w) === '-0.00000000000002246');
	assert (Precise.stringMul (w, x) === '-0.00000000000002246');
	assert (Precise.stringAdd (x, w) === '-0.000001103');
	assert (Precise.stringAdd (w, x) === '-0.000001103');
	assert (Precise.stringSub (x, w) === '0.000001143');
	assert (Precise.stringSub (w, x) === '-0.000001143');
	assert (Precise.stringDiv (x, w) === '-0.017809439002671415');
	assert (Precise.stringDiv (w, x) === '-56.15');
	
	assert (Precise.stringMul (z, w) === '0');
	assert (Precise.stringMul (z, x) === '0');
	assert (Precise.stringMul (z, y) === '0');
	assert (Precise.stringMul (w, z) === '0');
	assert (Precise.stringMul (x, z) === '0');
	assert (Precise.stringMul (y, z) === '0');
	assert (Precise.stringAdd (z, w) === '-0.000001123');
	assert (Precise.stringAdd (z, x) === '0.00000002');
	assert (Precise.stringAdd (z, y) === '69696900000');
	assert (Precise.stringAdd (w, z) === '-0.000001123');
	assert (Precise.stringAdd (x, z) === '0.00000002');
	assert (Precise.stringAdd (y, z) === '69696900000');
	
	assert (Precise.stringMul (x, a) === '2');
	assert (Precise.stringMul (a, x) === '2');
	assert (Precise.stringMul (y, a) === '6969690000000000000');
	assert (Precise.stringMul (a, y) === '6969690000000000000');
	assert (Precise.stringDiv (y, a) === '696.969');
	assert (Precise.stringDiv (y, a, -1) === '690');
	assert (Precise.stringDiv (y, a, 0) === '696');
	assert (Precise.stringDiv (y, a, 1) === '696.9');
	assert (Precise.stringDiv (y, a, 2) === '696.96');
	assert (Precise.stringDiv (a, y) === '0.001434784043479695');
	
	assert (Precise.stringAbs ('0') === '0');
	assert (Precise.stringAbs ('-0') === '0');
	assert (Precise.stringAbs ('-500.1') === '500.1');
	assert (Precise.stringAbs ('213') === '213');
	
	assert (Precise.stringNeg ('0') === '0');
	assert (Precise.stringNeg ('-0') === '0');
	assert (Precise.stringNeg ('-500.1') === '500.1');
	assert (Precise.stringNeg ('213') === '-213');
	
	assert (Precise.stringMod ('57.123', '10') === '7.123');
	assert (Precise.stringMod ('18', '6') === '0');
	assert (Precise.stringMod ('10.1', '0.5') === '0.1');
	assert (Precise.stringMod ('10000000', '5555') === '1000');
	assert (Precise.stringMod ('5550', '120') === '30');
	
	assert (Precise.stringEquals ('1.0000', '1'));
	assert (Precise.stringEquals ('-0.0', '0'));
	assert (Precise.stringEquals ('-0.0', '0.0'));
	assert (Precise.stringEquals ('5.534000', '5.5340'));
	
	assert (Precise.stringMin ('1.0000', '2') === '1');
	assert (Precise.stringMin ('2', '1.2345') === '1.2345');
	assert (Precise.stringMin ('3.1415', '-2') === '-2');
	assert (Precise.stringMin ('-3.1415', '-2') === '-3.1415');
	assert (Precise.stringMin ('0.000', '-0.0') === '0');
	
	assert (Precise.stringMax ('1.0000', '2') === '2');
	assert (Precise.stringMax ('2', '1.2345') === '2');
	assert (Precise.stringMax ('3.1415', '-2') === '3.1415');
	assert (Precise.stringMax ('-3.1415', '-2') === '-2');
	assert (Precise.stringMax ('0.000', '-0.0') === '0');
	
	assert (!Precise.stringGt ('1.0000', '2'));
	assert (Precise.stringGt ('2', '1.2345'));
	assert (Precise.stringGt ('3.1415', '-2'));
	assert (!Precise.stringGt ('-3.1415', '-2'));
	assert (!Precise.stringGt ('3.1415', '3.1415'));
	assert (Precise.stringGt ('3.14150000000000000000001', '3.1415'));
	
	assert (!Precise.stringGe ('1.0000', '2'));
	assert (Precise.stringGe ('2', '1.2345'));
	assert (Precise.stringGe ('3.1415', '-2'));
	assert (!Precise.stringGe ('-3.1415', '-2'));
	assert (Precise.stringGe ('3.1415', '3.1415'));
	assert (Precise.stringGe ('3.14150000000000000000001', '3.1415'));
	
	assert (Precise.stringLt ('1.0000', '2'));
	assert (!Precise.stringLt ('2', '1.2345'));
	assert (!Precise.stringLt ('3.1415', '-2'));
	assert (Precise.stringLt ('-3.1415', '-2'));
	assert (!Precise.stringLt ('3.1415', '3.1415'));
	assert (Precise.stringLt ('3.1415', '3.14150000000000000000001'));
	
	assert (Precise.stringLe ('1.0000', '2'));
	assert (!Precise.stringLe ('2', '1.2345'));
	assert (!Precise.stringLe ('3.1415', '-2'));
	assert (Precise.stringLe ('-3.1415', '-2'));
	assert (Precise.stringLe ('3.1415', '3.1415'));
	assert (Precise.stringLe ('3.1415', '3.14150000000000000000001'));
}

function testNumberToString () {
	// ----------------------------------------------------------------------------
	// numberToString
	
	assert (numberToString (-7.8e-7) === '-0.00000078');
	assert (numberToString (7.8e-7) === '0.00000078');
	assert (numberToString (-17.805e-7) === '-0.0000017805');
	assert (numberToString (17.805e-7) === '0.0000017805');
	assert (numberToString (-7.0005e27) === '-7000500000000000000000000000');
	assert (numberToString (7.0005e27) === '7000500000000000000000000000');
	assert (numberToString (-7.9e27) === '-7900000000000000000000000000');
	assert (numberToString (7e27) === '7000000000000000000000000000');
	assert (numberToString (7.9e27) === '7900000000000000000000000000');
	assert (numberToString (-12.345) === '-12.345');
	assert (numberToString (12.345) === '12.345');
	assert (numberToString (0) === '0');
	assert (numberToString (7.35946e21) === '7359460000000000000000');
	assert (numberToString (0.00000001) === '0.00000001');
	assert (numberToString (1e-7) === '0.0000001');
	assert (numberToString (-1e-7) === '-0.0000001');
}

function decimalToPrecisionTest (
	expectedResult,
	x,
	roundingMode,
    numPrecisionDigits,
    countingMode       = DECIMAL_PLACES,
    paddingMode        = NO_PADDING)
{
	assert (typeof x === 'string')
	assert (Number.isFinite (numPrecisionDigits))
	assert (decimalToPrecision (       x , roundingMode, numPrecisionDigits.toString (), countingMode, paddingMode) === expectedResult);
	assert (decimalToPrecision (       x , roundingMode, numPrecisionDigits,             countingMode, paddingMode) === expectedResult);
	assert (decimalToPrecision (Number(x), roundingMode, numPrecisionDigits.toString (), countingMode, paddingMode) === expectedResult);
	assert (decimalToPrecision (Number(x), roundingMode, numPrecisionDigits,             countingMode, paddingMode) === expectedResult);
}

function testDecimalToPrecisionTruncationToNDigitsAfterDot () {
	// ----------------------------------------------------------------------------
	// testDecimalToPrecisionTruncationToNDigitsAfterDot
	
	decimalToPrecisionTest ('12.3456', '12.3456000', TRUNCATE, 100, DECIMAL_PLACES);
	decimalToPrecisionTest ('12.3456', '12.3456', TRUNCATE, 100, DECIMAL_PLACES);
	decimalToPrecisionTest ('12.3456', '12.3456', TRUNCATE, 4, DECIMAL_PLACES);
	decimalToPrecisionTest ('12.345',  '12.3456', TRUNCATE, 3, DECIMAL_PLACES);
	decimalToPrecisionTest ('12.34',   '12.3456', TRUNCATE, 2, DECIMAL_PLACES);
	decimalToPrecisionTest ('12.3',    '12.3456', TRUNCATE, 1, DECIMAL_PLACES);
	decimalToPrecisionTest ('12',      '12.3456', TRUNCATE, 0, DECIMAL_PLACES);
	
	decimalToPrecisionTest ('0.0000001',  '0.0000001', TRUNCATE, 8, DECIMAL_PLACES);
	decimalToPrecisionTest ('0.00000001', '0.00000001', TRUNCATE, 8, DECIMAL_PLACES);
	
	decimalToPrecisionTest ('0.000000000', '0.000000000', TRUNCATE, 9, DECIMAL_PLACES, PAD_WITH_ZERO);
	decimalToPrecisionTest ('0.000000001', '0.000000001', TRUNCATE, 9, DECIMAL_PLACES, PAD_WITH_ZERO);
	
	decimalToPrecisionTest ('10',  '12.3456', TRUNCATE, -1, DECIMAL_PLACES);
	decimalToPrecisionTest ('120', '123.456', TRUNCATE, -1, DECIMAL_PLACES);
	decimalToPrecisionTest ('100', '123.456', TRUNCATE, -2, DECIMAL_PLACES);
	decimalToPrecisionTest ('0',   '9.99999', TRUNCATE, -1, DECIMAL_PLACES);
	decimalToPrecisionTest ('90',  '99.9999', TRUNCATE, -1, DECIMAL_PLACES);
	decimalToPrecisionTest ('0',   '99.9999', TRUNCATE, -2, DECIMAL_PLACES);
	
	decimalToPrecisionTest ('0', '0', TRUNCATE, 0, DECIMAL_PLACES);
	decimalToPrecisionTest ('0', '-0.9', TRUNCATE, 0, DECIMAL_PLACES);
}

function testDecimalToPrecisionTruncationToNSignificantDigits () {
	// ----------------------------------------------------------------------------
	// testDecimalToPrecisionTruncationToNSignificantDigits
	
	decimalToPrecisionTest ('0.0001234567', '0.000123456700', TRUNCATE, 100, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('0.0001234567', '0.0001234567', TRUNCATE, 100, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('0.0001234567', '0.0001234567', TRUNCATE, 7, SIGNIFICANT_DIGITS);
	
	decimalToPrecisionTest ('0.000123456', '0.000123456', TRUNCATE, 6, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('0.00012345',  '0.000123456', TRUNCATE, 5, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('0.00012',     '0.000123456', TRUNCATE, 2, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('0.0001',      '0.000123456', TRUNCATE, 1, SIGNIFICANT_DIGITS);
	
	decimalToPrecisionTest ('123.0000987', '123.0000987654', TRUNCATE, 10, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
	decimalToPrecisionTest ('123.00009',   '123.0000987654', TRUNCATE, 8, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('123.0000',    '123.0000987654', TRUNCATE, 7, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
	decimalToPrecisionTest ('123',         '123.0000987654', TRUNCATE, 6, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('123.00',      '123.0000987654', TRUNCATE, 5, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
	decimalToPrecisionTest ('123',         '123.0000987654', TRUNCATE, 4, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('123.0',       '123.0000987654', TRUNCATE, 4, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
	decimalToPrecisionTest ('123',         '123.0000987654', TRUNCATE, 3, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
	decimalToPrecisionTest ('120',         '123.0000987654', TRUNCATE, 2, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('100',         '123.0000987654', TRUNCATE, 1, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('100',         '123.0000987654', TRUNCATE, 1, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
	
	decimalToPrecisionTest ('1234',        '1234', TRUNCATE, 5, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('1234.0',      '1234', TRUNCATE, 5, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
	decimalToPrecisionTest ('1234',        '1234', TRUNCATE, 4, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('1234',        '1234', TRUNCATE, 4, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
	decimalToPrecisionTest ('0',           '1234.69', TRUNCATE, 0, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('0',           '1234.69', TRUNCATE, 0, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
}

function testDecimalToPrecisionRoundingToNDigitsAfterDot () {
	// ----------------------------------------------------------------------------
	// testDecimalToPrecisionRoundingToNDigitsAfterDot
	
	decimalToPrecisionTest ('12.3456', '12.3456000', ROUND, 100, DECIMAL_PLACES);
	decimalToPrecisionTest ('12.3456', '12.3456', ROUND, 100, DECIMAL_PLACES);
	decimalToPrecisionTest ('12.3456', '12.3456', ROUND, 4, DECIMAL_PLACES);
	decimalToPrecisionTest ('12.346',  '12.3456', ROUND, 3, DECIMAL_PLACES);
	decimalToPrecisionTest ('12.35',   '12.3456', ROUND, 2, DECIMAL_PLACES);
	decimalToPrecisionTest ('12.3',    '12.3456', ROUND, 1, DECIMAL_PLACES);
	decimalToPrecisionTest ('12',      '12.3456', ROUND, 0, DECIMAL_PLACES);
	
	decimalToPrecisionTest ('10000',   '10000', ROUND, 6, DECIMAL_PLACES);
	decimalToPrecisionTest ('0.00003186', '0.00003186', ROUND, 8, DECIMAL_PLACES);
	
	decimalToPrecisionTest ('10', '12.3456', ROUND, -1, DECIMAL_PLACES);
	decimalToPrecisionTest ('120', '123.456', ROUND, -1, DECIMAL_PLACES);
	decimalToPrecisionTest ('100', '123.456', ROUND, -2, DECIMAL_PLACES);
	decimalToPrecisionTest ('10', '9.99999', ROUND, -1, DECIMAL_PLACES);
	decimalToPrecisionTest ('100', '99.9999', ROUND, -1, DECIMAL_PLACES);
	decimalToPrecisionTest ('100', '99.9999', ROUND, -2, DECIMAL_PLACES);
	
	decimalToPrecisionTest ('9.999', '9.999', ROUND, 3, DECIMAL_PLACES);
	decimalToPrecisionTest ('10', '9.999', ROUND, 2, DECIMAL_PLACES);
	decimalToPrecisionTest ('10.00', '9.999', ROUND, 2, DECIMAL_PLACES, PAD_WITH_ZERO);
	decimalToPrecisionTest ('100.00', '99.999', ROUND, 2, DECIMAL_PLACES, PAD_WITH_ZERO);
	decimalToPrecisionTest ('-100.00', '-99.999', ROUND, 2, DECIMAL_PLACES, PAD_WITH_ZERO);
}

function testDecimalToPrecisionRoundingToNSignificantDigits () {
	// ----------------------------------------------------------------------------
	// testDecimalToPrecisionRoundingToNSignificantDigits
	
	decimalToPrecisionTest ('0.0001234567', '0.000123456700', ROUND, 100, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('0.0001234567', '0.0001234567', ROUND, 100, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('0.0001234567', '0.0001234567', ROUND, 7, SIGNIFICANT_DIGITS);
	
	decimalToPrecisionTest ('0.000123456', '0.000123456', ROUND, 6, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('0.00012346', '0.000123456', ROUND, 5, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('0.0001235', '0.000123456', ROUND, 4, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('0.00012', '0.00012', ROUND, 2, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('0.0001', '0.0001', ROUND, 1, SIGNIFICANT_DIGITS);
	
	decimalToPrecisionTest ('123.0001', '123.0000987654', ROUND, 7, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('123', '123.0000987654', ROUND, 6, SIGNIFICANT_DIGITS);
	
	decimalToPrecisionTest ('0.00099', '0.00098765', ROUND, 2, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('0.00099', '0.00098765', ROUND, 2, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
	
	decimalToPrecisionTest ('0.001', '0.00098765', ROUND, 1, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('0.0009876500000', '0.00098765', ROUND, 10, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
	
	decimalToPrecisionTest ('0.1', '0.098765', ROUND, 1, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
	
	decimalToPrecisionTest ('0', '0', ROUND, 0, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('0', '-0.123', ROUND, 0, SIGNIFICANT_DIGITS);
	
	decimalToPrecisionTest ('0.00000044', '0.00000044', ROUND, 5, SIGNIFICANT_DIGITS);
}

function testDecimalToPrecisionRoundingToTickSize () {
	// ----------------------------------------------------------------------------
	// testDecimalToPrecisionRoundingToTickSize
	
	decimalToPrecisionTest ('0.00012', '0.000123456700', ROUND, 0.00012, TICK_SIZE);
	decimalToPrecisionTest ('0.00013', '0.0001234567', ROUND, 0.00013, TICK_SIZE);
	decimalToPrecisionTest ('0', '0.0001234567', TRUNCATE, 0.00013, TICK_SIZE);
	decimalToPrecisionTest ('100', '101.000123456700', ROUND, 100, TICK_SIZE);
	decimalToPrecisionTest ('0', '0.000123456700', ROUND, 100, TICK_SIZE);
	decimalToPrecisionTest ('110', '165', TRUNCATE, 110, TICK_SIZE);
	decimalToPrecisionTest ('2220', '3210', TRUNCATE, 1110, TICK_SIZE);
	decimalToPrecisionTest ('220', '165', ROUND, 110, TICK_SIZE);
	decimalToPrecisionTest ('0.00012348', '0.000123456789', ROUND, 0.00000012, TICK_SIZE);
	decimalToPrecisionTest ('0.00012336', '0.000123456789', TRUNCATE, 0.00000012, TICK_SIZE);
	decimalToPrecisionTest ('0.0002734', '0.000273398', ROUND, 1e-7, TICK_SIZE);
	
	decimalToPrecisionTest ('0.00005714', '0.00005714', TRUNCATE, 0.00000001, TICK_SIZE);
	// this line causes problems in JS, fix with Precise
	// assert (decimalToPrecisionTest ('0.0000571495257361', TRUNCATE, 0.00000001, TICK_SIZE) === '0.00005714');
	
	decimalToPrecisionTest ('0.0100', '0.01', ROUND, 0.0001, TICK_SIZE, PAD_WITH_ZERO);
	decimalToPrecisionTest ('0.0100', '0.01', TRUNCATE, 0.0001, TICK_SIZE, PAD_WITH_ZERO);
	
	decimalToPrecisionTest ('-0.00012348', '-0.000123456789', ROUND, 0.00000012, TICK_SIZE);
	decimalToPrecisionTest ('-0.00012336', '-0.000123456789', TRUNCATE, 0.00000012, TICK_SIZE);
	decimalToPrecisionTest ('-110', '-165', TRUNCATE, 110, TICK_SIZE);
	decimalToPrecisionTest ('-220', '-165', ROUND, 110, TICK_SIZE);
	decimalToPrecisionTest ('-1100', '-1650', TRUNCATE, 1100, TICK_SIZE);
	decimalToPrecisionTest ('-2200', '-1650', ROUND, 1100, TICK_SIZE);
	
	decimalToPrecisionTest ('0.0006', '0.0006', TRUNCATE, 0.0001, TICK_SIZE);
	decimalToPrecisionTest ('-0.0006', '-0.0006', TRUNCATE, 0.0001, TICK_SIZE);
	decimalToPrecisionTest ('0.6', '0.6', TRUNCATE, 0.2, TICK_SIZE);
	decimalToPrecisionTest ('-0.6', '-0.6', TRUNCATE, 0.2, TICK_SIZE);
	decimalToPrecisionTest ('1.2', '1.2', ROUND, 0.4, TICK_SIZE);
	decimalToPrecisionTest ('-1.2', '-1.2', ROUND, 0.4, TICK_SIZE);
	decimalToPrecisionTest ('1.2', '1.2', ROUND, 0.02, TICK_SIZE);
	decimalToPrecisionTest ('-1.2', '-1.2', ROUND, 0.02, TICK_SIZE);
	decimalToPrecisionTest ('44', '44', ROUND, 4.4, TICK_SIZE);
	decimalToPrecisionTest ('-44', '-44', ROUND, 4.4, TICK_SIZE);
	decimalToPrecisionTest ('44', '44.00000001', ROUND, 4.4, TICK_SIZE);
	decimalToPrecisionTest ('-44', '-44.00000001', ROUND, 4.4, TICK_SIZE);
	
	// https://github.com/ccxt/ccxt/issues/6731
	decimalToPrecisionTest ('20', '20', TRUNCATE, 0.00000001, TICK_SIZE);
}

function testDecimalToPrecisionNegativeNumbers () {
	// ----------------------------------------------------------------------------
	// testDecimalToPrecisionNegativeNumbers
	
	decimalToPrecisionTest ('-0.12345', '-0.123456', TRUNCATE, 5, DECIMAL_PLACES);
	decimalToPrecisionTest ('-0.12346', '-0.123456', ROUND, 5, DECIMAL_PLACES);
}

function testDecimalToPrecisionWithoutDotTrailingDot () {
	// ----------------------------------------------------------------------------
	// decimalToPrecision: without dot / trailing dot
	
	decimalToPrecisionTest ('123', '123', TRUNCATE, 0);
	
	decimalToPrecisionTest ('123',       '123', TRUNCATE, 5, DECIMAL_PLACES);
	decimalToPrecisionTest ('123.00000', '123', TRUNCATE, 5, DECIMAL_PLACES, PAD_WITH_ZERO);
	
	decimalToPrecisionTest ('123',       '123.', TRUNCATE, 0, DECIMAL_PLACES);
	decimalToPrecisionTest ('123.00000', '123.', TRUNCATE, 5, DECIMAL_PLACES, PAD_WITH_ZERO);
	
	decimalToPrecisionTest ('0',         '0.', TRUNCATE, 0);
	decimalToPrecisionTest ('0.00000',   '0.', TRUNCATE, 5, DECIMAL_PLACES, PAD_WITH_ZERO);
}

function testDecimalToPrecisionRoundingForEquidistantDigits () {
	// ----------------------------------------------------------------------------
	// decimalToPrecision: rounding for equidistant digits
	
	decimalToPrecisionTest ('1.4', '1.44', ROUND, 1, DECIMAL_PLACES);
	decimalToPrecisionTest ('1.5', '1.45', ROUND, 1, DECIMAL_PLACES);
	decimalToPrecisionTest ('1',   '1.45', ROUND, 0, DECIMAL_PLACES); // not 2
}
	
function testDecimaltoPrecisionNegativeDecimalPlaces () {
	// ----------------------------------------------------------------------------
	// pretty useless for decimal applications as anything |x| < 5 === 0
	// NO_PADDING and PAD_WITH_ZERO are ignored
	
	decimalToPrecisionTest ('10', '5', ROUND, -1, DECIMAL_PLACES);
	decimalToPrecisionTest ('0', '4.999', ROUND, -1, DECIMAL_PLACES);
	decimalToPrecisionTest ('0', '0.0431531423', ROUND, -1, DECIMAL_PLACES);
	decimalToPrecisionTest ('-70', '-69.3', ROUND, -1, DECIMAL_PLACES);
	decimalToPrecisionTest ('10000', '5001', ROUND, -4, DECIMAL_PLACES);
	decimalToPrecisionTest ('0', '4999.999', ROUND, -4, DECIMAL_PLACES);
	
	decimalToPrecisionTest ('0', '69.3', TRUNCATE, -2, DECIMAL_PLACES);
	decimalToPrecisionTest ('0', '-69.3', TRUNCATE, -2, DECIMAL_PLACES);
}

function testDecimaltoPrecisionNegativeSignificantDigits () {
	// positive counts right from first digit, negative counts left from decimal point
	decimalToPrecisionTest ('60', '69.3', TRUNCATE, -1, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('-60', '-69.3', TRUNCATE, -1, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('0', '69.3', TRUNCATE, -2, SIGNIFICANT_DIGITS);
	decimalToPrecisionTest ('1600000000000000000000', '1602000000000000000000', TRUNCATE, 3, SIGNIFICANT_DIGITS);
}

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
//
// throws (() =>
//     decimalToPrecision ('0.01', TRUNCATE, -1, TICK_SIZE),
//         "TICK_SIZE cant be used with negative numPrecisionDigits")


function getFunctionName (func) {
	return func.toString().replace(/\n/g,'').replace(/^function +([a-zA-Z]+) *\([^)]*\).*$/,'$1');
	//return 'func';
}

function runOneTest (testFunc) {
	const numRepeats = 50000;
	
	const t0 = performance.now();
	for (var i = 0; i < numRepeats; ++i ) {
		testFunc ();
	}
	const t1 = performance.now();
	const t = (t1-t0)/numRepeats;
	const s = t.toFixed(6)
	console.log (`${s}, ${getFunctionName(testFunc)}`)
}


function runAllTests () {
	
	const t0 = performance.now();
	console.log('Testing JavaScript');
	console.log('times in milliseconds');
	runOneTest (testPrecise);
	runOneTest (testNumberToString);
	runOneTest (testDecimalToPrecisionTruncationToNDigitsAfterDot);
	runOneTest (testDecimalToPrecisionTruncationToNSignificantDigits);
	runOneTest (testDecimalToPrecisionRoundingToNDigitsAfterDot);
	runOneTest (testDecimalToPrecisionRoundingToNSignificantDigits);
	runOneTest (testDecimalToPrecisionRoundingToTickSize);
	runOneTest (testDecimalToPrecisionNegativeNumbers);
	runOneTest (testDecimalToPrecisionWithoutDotTrailingDot);
	runOneTest (testDecimalToPrecisionRoundingForEquidistantDigits);
	runOneTest (testDecimaltoPrecisionNegativeDecimalPlaces)
	runOneTest (testDecimaltoPrecisionNegativeSignificantDigits)
	const t1 = performance.now();
	const t = t1 - t0;
	const s = t.toFixed (6)
	console.log (`${s}, runAllTests`)
}

runAllTests ()
