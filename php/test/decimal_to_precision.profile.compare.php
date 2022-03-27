<?php
namespace ccxt;
include_once (__DIR__.'/../../ccxt.php');
include_once (__DIR__.'/fail_on_all_errors.php');

// testDecimalToPrecisionErrorHandling
//
// $this->expectException ('ccxt\\BaseError');
// $this->expectExceptionMessageRegExp ('/Negative precision is not yet supported/');
// Exchange::decimalToPrecision ('123456.789', TRUNCATE, -2, DECIMAL_PLACES);
//
// $this->expectException ('ccxt\\BaseError');
// $this->expectExceptionMessageRegExp ('/Invalid number/');
// Exchange::decimalToPrecision ('foo');

// ----------------------------------------------------------------------------

function decimal_to_precision ($x, $roundingMode = ROUND, $numPrecisionDigits = null, $countingMode = DECIMAL_PLACES, $paddingMode = NO_PADDING) {
    return Exchange::decimal_to_precision ($x, $roundingMode, $numPrecisionDigits, $countingMode, $paddingMode);
}
function number_to_string ($x) {
    return Exchange::number_to_string ($x);
}

// ----------------------------------------------------------------------------
// Precise

$testPrecise = function() {
    $w = '-1.123e-6';
    $x = '0.00000002';
    $y = '69696900000';
    $z = '0';
    $a = '1e8';
    
    assert (Precise::string_mul($x, $y) === '1393.938');
    assert (Precise::string_mul($y, $x) === '1393.938');
    assert (Precise::string_add($x, $y) === '69696900000.00000002');
    assert (Precise::string_add($y, $x) === '69696900000.00000002');
    assert (Precise::string_sub($x, $y) === '-69696899999.99999998');
    assert (Precise::string_sub($y, $x) === '69696899999.99999998');
    assert (Precise::string_div($x, $y, 1) === '0');
    assert (Precise::string_div($x, $y) === '0');
    assert (Precise::string_div($x, $y, 19) === '0.0000000000000000002');
    assert (Precise::string_div($x, $y, 20) === '0.00000000000000000028');
    assert (Precise::string_div($x, $y, 21) === '0.000000000000000000286');
    assert (Precise::string_div($x, $y, 22) === '0.0000000000000000002869');
    assert (Precise::string_div($y, $x) === '3484845000000000000');
    
    assert (Precise::string_mul($x, $w) === '-0.00000000000002246');
    assert (Precise::string_mul($w, $x) === '-0.00000000000002246');
    assert (Precise::string_add($x, $w) === '-0.000001103');
    assert (Precise::string_add($w, $x) === '-0.000001103');
    assert (Precise::string_sub($x, $w) === '0.000001143');
    assert (Precise::string_sub($w, $x) === '-0.000001143');
    assert (Precise::string_div($x, $w) === '-0.017809439002671415');
    assert (Precise::string_div($w, $x) === '-56.15');
    
    assert (Precise::string_mul($z, $w) === '0');
    assert (Precise::string_mul($z, $x) === '0');
    assert (Precise::string_mul($z, $y) === '0');
    assert (Precise::string_mul($w, $z) === '0');
    assert (Precise::string_mul($x, $z) === '0');
    assert (Precise::string_mul($y, $z) === '0');
    assert (Precise::string_add($z, $w) === '-0.000001123');
    assert (Precise::string_add($z, $x) === '0.00000002');
    assert (Precise::string_add($z, $y) === '69696900000');
    assert (Precise::string_add($w, $z) === '-0.000001123');
    assert (Precise::string_add($x, $z) === '0.00000002');
    assert (Precise::string_add($y, $z) === '69696900000');
    
    assert (Precise::string_mul($x, $a) === '2');
    assert (Precise::string_mul($a, $x) === '2');
    assert (Precise::string_mul($y, $a) === '6969690000000000000');
    assert (Precise::string_mul($a, $y) === '6969690000000000000');
    assert (Precise::string_div($y, $a) === '696.969');
    assert (Precise::string_div($y, $a, -1) === '690');
    assert (Precise::string_div($y, $a, 0) === '696');
    assert (Precise::string_div($y, $a, 1) === '696.9');
    assert (Precise::string_div($y, $a, 2) === '696.96');
    assert (Precise::string_div($a, $y) === '0.001434784043479695');
    assert (Precise::string_div($w, $y, 22) === '-0.0000000000000000161126');
    assert (Precise::string_div($w, $y) === '-0.000000000000000016');
    
    assert (Precise::string_abs('0') === '0');
    assert (Precise::string_abs('-0') === '0');
    assert (Precise::string_abs('-500.1') === '500.1');
    assert (Precise::string_abs('213') === '213');
    
    assert (Precise::string_neg('0') === '0');
    assert (Precise::string_neg('-0') === '0');
    assert (Precise::string_neg('-500.1') === '500.1');
    assert (Precise::string_neg('213') === '-213');
    
    assert (Precise::string_mod('57.123', '10') === '7.123');
    assert (Precise::string_mod('18', '6') === '0');
    assert (Precise::string_mod('10.1', '0.5') === '0.1');
    assert (Precise::string_mod('10000000', '5555') === '1000');
    assert (Precise::string_mod('5550', '120') === '30');
    assert (Precise::string_mod('0.000123456700', '0.00012') === '0.0000034567');
    assert (Precise::string_mod('-57.123', '10') === '2.877');
    assert (Precise::string_mod('-18', '6') === '0');
    assert (Precise::string_mod('-10.1', '0.5') === '0.4');
    assert (Precise::string_mod('-10000000', '5555') === '4555');
    assert (Precise::string_mod('-5550', '120') === '90');
    assert (Precise::string_mod('-0.000123456700', '0.00012') === '0.0001165433');
    
    assert (Precise::string_equals('1.0000', '1'));
    assert (Precise::string_equals('-0.0', '0'));
    assert (Precise::string_equals('-0.0', '0.0'));
    assert (Precise::string_equals('5.534000', '5.5340'));
    
    assert (Precise::string_min('1.0000', '2') === '1');
    assert (Precise::string_min('2', '1.2345') === '1.2345');
    assert (Precise::string_min('3.1415', '-2') === '-2');
    assert (Precise::string_min('-3.1415', '-2') === '-3.1415');
    assert (Precise::string_min('0.000', '-0.0') === '0');
    
    assert (Precise::string_max('1.0000', '2') === '2');
    assert (Precise::string_max('2', '1.2345') === '2');
    assert (Precise::string_max('3.1415', '-2') === '3.1415');
    assert (Precise::string_max('-3.1415', '-2') === '-2');
    assert (Precise::string_max('0.000', '-0.0') === '0');
    
    assert (!Precise::string_gt('1.0000', '2'));
    assert (Precise::string_gt('2', '1.2345'));
    assert (Precise::string_gt('3.1415', '-2'));
    assert (!Precise::string_gt('-3.1415', '-2'));
    assert (!Precise::string_gt('3.1415', '3.1415'));
    assert (Precise::string_gt('3.14150000000000000000001', '3.1415'));
    
    assert (!Precise::string_ge('1.0000', '2'));
    assert (Precise::string_ge('2', '1.2345'));
    assert (Precise::string_ge('3.1415', '-2'));
    assert (!Precise::string_ge('-3.1415', '-2'));
    assert (Precise::string_ge('3.1415', '3.1415'));
    assert (Precise::string_ge('3.14150000000000000000001', '3.1415'));
    
    assert (Precise::string_lt('1.0000', '2'));
    assert (!Precise::string_lt('2', '1.2345'));
    assert (!Precise::string_lt('3.1415', '-2'));
    assert (Precise::string_lt('-3.1415', '-2'));
    assert (!Precise::string_lt('3.1415', '3.1415'));
    assert (Precise::string_lt('3.1415', '3.14150000000000000000001'));
    
    assert (Precise::string_le('1.0000', '2'));
    assert (!Precise::string_le('2', '1.2345'));
    assert (!Precise::string_le('3.1415', '-2'));
    assert (Precise::string_le('-3.1415', '-2'));
    assert (Precise::string_le('3.1415', '3.1415'));
    assert (Precise::string_le('3.1415', '3.14150000000000000000001'));
};

// ----------------------------------------------------------------------------
// number_to_string
$testNumberToString = function() {
    
    assert (number_to_string (-7.8e-7) === '-0.00000078');
    assert (number_to_string (7.8e-7) === '0.00000078');
    assert (number_to_string (-17.805e-7) === '-0.0000017805');
    assert (number_to_string (17.805e-7) === '0.0000017805');
    assert (number_to_string (-7.0005e27) === '-7000500000000000000000000000');
    assert (number_to_string (7.0005e27) === '7000500000000000000000000000');
    assert (number_to_string (-7.9e27) === '-7900000000000000000000000000');
    assert (number_to_string (7e27) === '7000000000000000000000000000');
    assert (number_to_string (7.9e27) === '7900000000000000000000000000');
    assert (number_to_string (-12.345) === '-12.345');
    assert (number_to_string (12.345) === '12.345');
    assert (number_to_string (0) === '0');
    assert (number_to_string (7.35946e21) === '7359460000000000000000');
    assert (number_to_string (0.00000001) === '0.00000001');
    assert (number_to_string (1e-7) === '0.0000001');
    assert (number_to_string (-1e-7) === '-0.0000001');
};

function decimal_to_precision_test(
    $expectedResult,
    $x,
    $roundingMode,
    $numPrecisionDigits,
    $countingMode = DECIMAL_PLACES,
    $paddingMode = NO_PADDING
)
{
    assert (is_string($x));
    assert (is_float($numPrecisionDigits) or is_int($numPrecisionDigits));
    //assert (decimal_to_precision (         $x , $roundingMode, strval($numPrecisionDigits), $countingMode, $paddingMode ) === $expectedResult );
    assert (decimal_to_precision (         $x , $roundingMode,        $numPrecisionDigits , $countingMode, $paddingMode ) === $expectedResult );
    //assert (decimal_to_precision (floatval($x), $roundingMode, strval($numPrecisionDigits), $countingMode, $paddingMode ) === $expectedResult );
    //assert (decimal_to_precision (floatval($x), $roundingMode,        $numPrecisionDigits , $countingMode, $paddingMode ) === $expectedResult );
}

// ----------------------------------------------------------------------------
// testDecimalToPrecisionTruncationToNDigitsAfterDot
$testDecimalToPrecisionTruncationToNDigitsAfterDot = function() {
    
    decimal_to_precision_test ('12.3456', '12.3456000', TRUNCATE, 100, DECIMAL_PLACES);
    decimal_to_precision_test ('12.3456', '12.3456', TRUNCATE, 100, DECIMAL_PLACES);
    decimal_to_precision_test ('12.3456', '12.3456', TRUNCATE, 4, DECIMAL_PLACES);
    decimal_to_precision_test ('12.345', '12.3456', TRUNCATE, 3, DECIMAL_PLACES);
    decimal_to_precision_test ('12.34', '12.3456', TRUNCATE, 2, DECIMAL_PLACES);
    decimal_to_precision_test ('12.3', '12.3456', TRUNCATE, 1, DECIMAL_PLACES);
    decimal_to_precision_test ('12', '12.3456', TRUNCATE, 0, DECIMAL_PLACES);
    
    decimal_to_precision_test ('0.0000001', '0.0000001', TRUNCATE, 8, DECIMAL_PLACES);
    decimal_to_precision_test ('0.00000001', '0.00000001', TRUNCATE, 8, DECIMAL_PLACES);
    
    decimal_to_precision_test ('0.000000000', '0.000000000', TRUNCATE, 9, DECIMAL_PLACES, PAD_WITH_ZERO);
    decimal_to_precision_test ('0.000000001', '0.000000001', TRUNCATE, 9, DECIMAL_PLACES, PAD_WITH_ZERO);
    
    decimal_to_precision_test ('10', '12.3456', TRUNCATE, -1, DECIMAL_PLACES);
    decimal_to_precision_test ('120', '123.456', TRUNCATE, -1, DECIMAL_PLACES);
    decimal_to_precision_test ('100', '123.456', TRUNCATE, -2, DECIMAL_PLACES);
    decimal_to_precision_test ('0', '9.99999', TRUNCATE, -1, DECIMAL_PLACES);
    decimal_to_precision_test ('90', '99.9999', TRUNCATE, -1, DECIMAL_PLACES);
    decimal_to_precision_test ('0', '99.9999', TRUNCATE, -2, DECIMAL_PLACES);
    
    decimal_to_precision_test ('0', '0', TRUNCATE, 0, DECIMAL_PLACES);
    decimal_to_precision_test ('0', '-0.9', TRUNCATE, 0, DECIMAL_PLACES);
};

// ----------------------------------------------------------------------------
// testDecimalToPrecisionTruncationToNSignificantDigits
$testDecimalToPrecisionTruncationToNSignificantDigits = function() {
    
    decimal_to_precision_test ('0.0001234567', '0.000123456700', TRUNCATE, 100, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('0.0001234567', '0.0001234567', TRUNCATE, 100, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('0.0001234567', '0.0001234567', TRUNCATE, 7, SIGNIFICANT_DIGITS);
    
    decimal_to_precision_test ('0.000123456', '0.000123456', TRUNCATE, 6, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('0.00012345', '0.000123456', TRUNCATE, 5, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('0.00012', '0.000123456', TRUNCATE, 2, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('0.0001', '0.000123456', TRUNCATE, 1, SIGNIFICANT_DIGITS);
    
    decimal_to_precision_test ('123.0000987', '123.0000987654', TRUNCATE, 10, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
    decimal_to_precision_test ('123.00009', '123.0000987654', TRUNCATE, 8, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('123.0000', '123.0000987654', TRUNCATE, 7, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
    decimal_to_precision_test ('123', '123.0000987654', TRUNCATE, 6, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('123.00', '123.0000987654', TRUNCATE, 5, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
    decimal_to_precision_test ('123', '123.0000987654', TRUNCATE, 4, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('123.0', '123.0000987654', TRUNCATE, 4, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
    decimal_to_precision_test ('123', '123.0000987654', TRUNCATE, 3, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
    decimal_to_precision_test ('120', '123.0000987654', TRUNCATE, 2, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('100', '123.0000987654', TRUNCATE, 1, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('100', '123.0000987654', TRUNCATE, 1, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
    
    decimal_to_precision_test ('1234', '1234', TRUNCATE, 5, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('1234.0', '1234', TRUNCATE, 5, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
    decimal_to_precision_test ('1234', '1234', TRUNCATE, 4, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('1234', '1234', TRUNCATE, 4, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
    decimal_to_precision_test ('0', '1234.69', TRUNCATE, 0, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('0', '1234.69', TRUNCATE, 0, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
};

// ----------------------------------------------------------------------------
// testDecimalToPrecisionRoundingToNDigitsAfterDot
$testDecimalToPrecisionRoundingToNDigitsAfterDot = function() {
    decimal_to_precision_test ('12.3456', '12.3456000', ROUND, 100, DECIMAL_PLACES);
    decimal_to_precision_test ('12.3456', '12.3456', ROUND, 100, DECIMAL_PLACES);
    decimal_to_precision_test ('12.3456', '12.3456', ROUND, 4, DECIMAL_PLACES);
    decimal_to_precision_test ('12.346', '12.3456', ROUND, 3, DECIMAL_PLACES);
    decimal_to_precision_test ('12.35', '12.3456', ROUND, 2, DECIMAL_PLACES);
    decimal_to_precision_test ('12.3', '12.3456', ROUND, 1, DECIMAL_PLACES);
    decimal_to_precision_test ('12', '12.3456', ROUND, 0, DECIMAL_PLACES);
    
    decimal_to_precision_test ('10000', '10000', ROUND, 6, DECIMAL_PLACES);
    decimal_to_precision_test ('0.00003186', '0.00003186', ROUND, 8, DECIMAL_PLACES);
    
    decimal_to_precision_test ('10', '12.3456', ROUND, -1, DECIMAL_PLACES);
    decimal_to_precision_test ('120', '123.456', ROUND, -1, DECIMAL_PLACES);
    decimal_to_precision_test ('100', '123.456', ROUND, -2, DECIMAL_PLACES);
    decimal_to_precision_test ('10', '9.99999', ROUND, -1, DECIMAL_PLACES);
    decimal_to_precision_test ('100', '99.9999', ROUND, -1, DECIMAL_PLACES);
    decimal_to_precision_test ('100', '99.9999', ROUND, -2, DECIMAL_PLACES);
    
    decimal_to_precision_test ('9.999', '9.999', ROUND, 3, DECIMAL_PLACES);
    decimal_to_precision_test ('10', '9.999', ROUND, 2, DECIMAL_PLACES);
    decimal_to_precision_test ('10.00', '9.999', ROUND, 2, DECIMAL_PLACES, PAD_WITH_ZERO);
    decimal_to_precision_test ('100.00', '99.999', ROUND, 2, DECIMAL_PLACES, PAD_WITH_ZERO);
    decimal_to_precision_test ('-100.00', '-99.999', ROUND, 2, DECIMAL_PLACES, PAD_WITH_ZERO);
};

// ----------------------------------------------------------------------------
// testDecimalToPrecisionRoundingToNSignificantDigits
$testDecimalToPrecisionRoundingToNSignificantDigits = function() {
    
    decimal_to_precision_test ('0.0001234567', '0.000123456700', ROUND, 100, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('0.0001234567', '0.0001234567', ROUND, 100, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('0.0001234567', '0.0001234567', ROUND, 7, SIGNIFICANT_DIGITS);
    
    decimal_to_precision_test ('0.000123456', '0.000123456', ROUND, 6, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('0.00012346', '0.000123456', ROUND, 5, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('0.0001235', '0.000123456', ROUND, 4, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('0.00012', '0.00012', ROUND, 2, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('0.0001', '0.0001', ROUND, 1, SIGNIFICANT_DIGITS);
    
    decimal_to_precision_test ('123.0001', '123.0000987654', ROUND, 7, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('123', '123.0000987654', ROUND, 6, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('120', '123.0000987654', ROUND, 2, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('130', '127.0000987654', ROUND, 2, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('100', '123.0000987654', ROUND, 1, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('200', '177.0000987654', ROUND, 1, SIGNIFICANT_DIGITS);
    
    decimal_to_precision_test ('0.00099', '0.00098765', ROUND, 2, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('0.00099', '0.00098765', ROUND, 2, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
    
    decimal_to_precision_test ('0.001', '0.00098765', ROUND, 1, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('0.0009876500000', '0.00098765', ROUND, 10, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
    
    decimal_to_precision_test ('0.1', '0.098765', ROUND, 1, SIGNIFICANT_DIGITS, PAD_WITH_ZERO);
    
    decimal_to_precision_test ('0', '0', ROUND, 0, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('0', '-0.123', ROUND, 0, SIGNIFICANT_DIGITS);
    
    decimal_to_precision_test ('0.00000044', '0.00000044', ROUND, 5, SIGNIFICANT_DIGITS);
};

// ----------------------------------------------------------------------------
// testDecimalToPrecisionRoundingToTickSize
$testDecimalToPrecisionRoundingToTickSize = function() {
    
    decimal_to_precision_test ('0.00012', '0.000123456700', ROUND, 0.00012, TICK_SIZE);
    decimal_to_precision_test ('0.00013', '0.0001234567', ROUND, 0.00013, TICK_SIZE);
    decimal_to_precision_test ('0', '0.0001234567', TRUNCATE, 0.00013, TICK_SIZE);
    decimal_to_precision_test ('100', '101.000123456700', ROUND, 100, TICK_SIZE);
    decimal_to_precision_test ('0', '0.000123456700', ROUND, 100, TICK_SIZE);
    decimal_to_precision_test ('110', '165', TRUNCATE, 110, TICK_SIZE);
    decimal_to_precision_test ('2220', '3210', TRUNCATE, 1110, TICK_SIZE);
    decimal_to_precision_test ('220', '165', ROUND, 110, TICK_SIZE);
    decimal_to_precision_test ('0.00012348', '0.000123456789', ROUND, 0.00000012, TICK_SIZE);
    decimal_to_precision_test ('0.00012336', '0.000123456789', TRUNCATE, 0.00000012, TICK_SIZE);
    decimal_to_precision_test ('0.0002734', '0.000273398', ROUND, 1e-7, TICK_SIZE);
    
    decimal_to_precision_test ('0.00005714', '0.00005714', TRUNCATE, 0.00000001, TICK_SIZE);
    // this line causes problems in JS AND PHP
    // decimal_to_precision_test ('0.00005714', '0.0000571495257361', TRUNCATE, 0.00000001, TICK_SIZE);
    
    decimal_to_precision_test ('0.0100', '0.01', ROUND, 0.0001, TICK_SIZE, PAD_WITH_ZERO);
    decimal_to_precision_test ('0.0100', '0.01', TRUNCATE, 0.0001, TICK_SIZE, PAD_WITH_ZERO);
    
    decimal_to_precision_test ('-0.00012348', '-0.000123456789', ROUND, 0.00000012, TICK_SIZE);
    decimal_to_precision_test ('-0.00012336', '-0.000123456789', TRUNCATE, 0.00000012, TICK_SIZE);
    decimal_to_precision_test ('-110', '-165', TRUNCATE, 110, TICK_SIZE);
    decimal_to_precision_test ('-220', '-165', ROUND, 110, TICK_SIZE);
    decimal_to_precision_test ('-1100', '-1650', TRUNCATE, 1100, TICK_SIZE);
    decimal_to_precision_test ('-2200', '-1650', ROUND, 1100, TICK_SIZE);
    
    decimal_to_precision_test ('0.0006', '0.0006', TRUNCATE, 0.0001, TICK_SIZE);
    decimal_to_precision_test ('-0.0006', '-0.0006', TRUNCATE, 0.0001, TICK_SIZE);
    decimal_to_precision_test ('0.6', '0.6', TRUNCATE, 0.2, TICK_SIZE);
    decimal_to_precision_test ('-0.6', '-0.6', TRUNCATE, 0.2, TICK_SIZE);
    decimal_to_precision_test ('1.2', '1.2', ROUND, 0.4, TICK_SIZE);
    decimal_to_precision_test ('-1.2', '-1.2', ROUND, 0.4, TICK_SIZE);
    decimal_to_precision_test ('1.2', '1.2', ROUND, 0.02, TICK_SIZE);
    decimal_to_precision_test ('-1.2', '-1.2', ROUND, 0.02, TICK_SIZE);
    decimal_to_precision_test ('44', '44', ROUND, 4.4, TICK_SIZE);
    decimal_to_precision_test ('-44', '-44', ROUND, 4.4, TICK_SIZE);
    decimal_to_precision_test ('44', '44.00000001', ROUND, 4.4, TICK_SIZE);
    decimal_to_precision_test ('-44', '-44.00000001', ROUND, 4.4, TICK_SIZE);
    
    // https://github.com/ccxt/ccxt/issues/6731
    // decimal_to_precision_test ('20', '20', TRUNCATE, 0.00000001, TICK_SIZE);
};

// ----------------------------------------------------------------------------
// testDecimalToPrecisionNegativeNumbers
$testDecimalToPrecisionNegativeNumbers = function() {

    decimal_to_precision_test ('-0.12345', '-0.123456', TRUNCATE, 5, DECIMAL_PLACES);
    decimal_to_precision_test ('-0.12346', '-0.123456', ROUND, 5, DECIMAL_PLACES);
};

// ----------------------------------------------------------------------------
// decimal_to_precision => without dot / trailing dot
$testDecimalToPrecisionWithoutDotTrailingDot = function() {

    decimal_to_precision_test ('123', '123', TRUNCATE, 0);
    
    decimal_to_precision_test ('123', '123', TRUNCATE, 5, DECIMAL_PLACES);
    decimal_to_precision_test ('123.00000', '123', TRUNCATE, 5, DECIMAL_PLACES, PAD_WITH_ZERO);
    
    decimal_to_precision_test ('123', '123.', TRUNCATE, 0, DECIMAL_PLACES);
    decimal_to_precision_test ('123.00000', '123.', TRUNCATE, 5, DECIMAL_PLACES, PAD_WITH_ZERO);
    
    decimal_to_precision_test ('0', '0.', TRUNCATE, 0);
    decimal_to_precision_test ('0.00000', '0.', TRUNCATE, 5, DECIMAL_PLACES, PAD_WITH_ZERO);
};

// ----------------------------------------------------------------------------
// decimal_to_precision => rounding for equidistant digits
$testDecimalToPrecisionRoundingForEquidistantDigits = function() {
    
    decimal_to_precision_test ('1.4', '1.44', ROUND, 1, DECIMAL_PLACES);
    decimal_to_precision_test ('1.5', '1.45', ROUND, 1, DECIMAL_PLACES);
    decimal_to_precision_test ('1', '1.45', ROUND, 0, DECIMAL_PLACES); // not 2
};

// ----------------------------------------------------------------------------
// negative precision only implemented so far in python
// pretty useless for decimal applications as anything |$x| < 5 === 0
// NO_PADDING and PAD_WITH_ZERO are ignored
//$testDecimaltoPrecisionNegativeDecimalPlaces = function() {
$testDecimaltoPrecisionNDP = function() {
        
    decimal_to_precision_test ('10', '5', ROUND, -1, DECIMAL_PLACES);
    decimal_to_precision_test ('0', '4.999', ROUND, -1, DECIMAL_PLACES);
    decimal_to_precision_test ('0', '0.0431531423', ROUND, -1, DECIMAL_PLACES);
    decimal_to_precision_test ('-70', '-69.3', ROUND, -1, DECIMAL_PLACES);
    decimal_to_precision_test ('10000', '5001', ROUND, -4, DECIMAL_PLACES);
    decimal_to_precision_test ('0', '4999.999', ROUND, -4, DECIMAL_PLACES);
    
    decimal_to_precision_test ('0', '69.3', TRUNCATE, -2, DECIMAL_PLACES);
    decimal_to_precision_test ('0', '-69.3', TRUNCATE, -2, DECIMAL_PLACES);
    decimal_to_precision_test ('60', '69.3', TRUNCATE, 1, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('-60', '-69.3', TRUNCATE, 1, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('0', '69.3', TRUNCATE, 0, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('1600000000000000000000', '1602000000000000000000', TRUNCATE, 3, SIGNIFICANT_DIGITS);
};

$testDecimalToPrecisionNegativeSignificantDigits = function() {
    # positive counts right from first digit, negative counts left from decimal point
    decimal_to_precision_test ('60', '69.3', TRUNCATE, -1, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('-60', '-69.3', TRUNCATE, -1, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('0', '69.3', TRUNCATE, -2, SIGNIFICANT_DIGITS);
    decimal_to_precision_test ('1600000000000000000000', '1602000000000000000000', TRUNCATE, 3, SIGNIFICANT_DIGITS);
};

// ----------------------------------------------------------------------------
// testDecimalToPrecisionErrorHandling (todo)
//
// throws (() =>
//     decimal_to_precision ('123456.789', TRUNCATE, -2, DECIMAL_PLACES),
//         'negative precision is not yet supported')
//
// throws (() =>
//     decimal_to_precision ('foo'),
//         "invalid number (contains an illegal character 'f')")
//
// throws (() =>
//     decimal_to_precision ('0.01', TRUNCATE, -1, TICK_SIZE),
//         "TICK_SIZE cant be used with negative numPrecisionDigits")

// ----------------------------------------------------------------------------

function runOneTest ($testFunc, $testName) {
    $numRepeats = 50000;
    //$numRepeats = 1;
    
    $t0 = hrtime(true);
    for ( $i = 0; $i < $numRepeats; ++$i ) {
        $testFunc();
    }
    $t1 = hrtime(true);
    $t = ($t1 - $t0) / $numRepeats;
    // hrtime returns nanoseconds
    print( number_format($t/1000000,6,'.','') . ', '. $testName . "\n" );
}

function runAllTests () {
    
    $t0 = hrtime(true);
    print("Testing PHP\n");
    print("times in milliseconds\n");
    global $testPrecise;
    runOneTest ($testPrecise, "testPrecise");
    global $testNumberToString;
    runOneTest ($testNumberToString, "testNumberToString");
    global $testDecimalToPrecisionTruncationToNDigitsAfterDot;
    runOneTest ($testDecimalToPrecisionTruncationToNDigitsAfterDot, "testDecimalToPrecisionTruncationToNDigitsAfterDot");
    global $testDecimalToPrecisionTruncationToNSignificantDigits;
    runOneTest ($testDecimalToPrecisionTruncationToNSignificantDigits, "testDecimalToPrecisionTruncationToNSignificantDigits");
    global $testDecimalToPrecisionRoundingToNDigitsAfterDot;
    runOneTest ($testDecimalToPrecisionRoundingToNDigitsAfterDot, "testDecimalToPrecisionRoundingToNDigitsAfterDot");
    global $testDecimalToPrecisionRoundingToNSignificantDigits;
    runOneTest ($testDecimalToPrecisionRoundingToNSignificantDigits, "testDecimalToPrecisionRoundingToNSignificantDigits");
    global $testDecimalToPrecisionRoundingToTickSize;
    runOneTest ($testDecimalToPrecisionRoundingToTickSize, "testDecimalToPrecisionRoundingToTickSize");
    global $testDecimalToPrecisionNegativeNumbers;
    runOneTest ($testDecimalToPrecisionNegativeNumbers, "testDecimalToPrecisionNegativeNumbers");
    global $testDecimalToPrecisionWithoutDotTrailingDot;
    runOneTest ($testDecimalToPrecisionWithoutDotTrailingDot, "testDecimalToPrecisionWithoutDotTrailingDot");
    global $testDecimalToPrecisionRoundingForEquidistantDigits;
    runOneTest ($testDecimalToPrecisionRoundingForEquidistantDigits, "testDecimalToPrecisionRoundingForEquidistantDigits");
//    When declared using this variable name, it is not a Closure ?!?    
//    global $testDecimalToPrecisionNegativeDecimalPlaces;
//    runOneTest ($testDecimalToPrecisionNegativeDecimalPlaces, "testDecimalToPrecisionNegativeDecimalPlaces");
    global $testDecimaltoPrecisionNDP;
    runOneTest ($testDecimaltoPrecisionNDP, "testDecimalToPrecisionNegativeDecimalPlaces");
    //global $testDecimalToPrecisionNegativeSignificantDigits;
    //runOneTest ($testDecimalToPrecisionNegativeSignificantDigits, "testDecimalToPrecisionNegativeSignificantDigits");
    $t1 = hrtime(true);
    $t = $t1 - $t0;
    // hrtime returns nanoseconds
    print( number_format($t/1000000,6,'.','') . ", runAllTests\n");
}

runAllTests ();
