<?php

use ccxt\Exchange;
use PHPUnit\Framework\TestCase;
use const ccxt\AFTER_POINT;
use const ccxt\NO_PADDING;
use const ccxt\PAD_WITH_ZERO;
use const ccxt\ROUND;
use const ccxt\SIGNIFICANT_DIGITS;
use const ccxt\TRUNCATE;

class ExchangeTest extends TestCase {

    public function testSum () {
        $this->assertSame (0,   Exchange::sum ());
        $this->assertSame (2,   Exchange::sum (2));
        $this->assertSame (432, Exchange::sum (2, 30, 400));
        $this->assertSame (439, Exchange::sum (2, null, [88], 30, '7', 400, null));
    }

    public function testDecimalToPrecisionErrorHandling () {
        $this->expectException ('ccxt\\BaseError');
        $this->expectExceptionMessageRegExp ('/Negative precision is not yet supported/');
        Exchange::decimalToPrecision ('123456.789', TRUNCATE, -2, AFTER_POINT);

        $this->expectException ('ccxt\\BaseError');
        $this->expectExceptionMessageRegExp ('/Invalid number/');
        Exchange::decimalToPrecision ('foo');
    }

    /**
     * @dataProvider truncationToNDigitsAfterDot
     */
    public function testDecimalToPrecisionTruncationToNDigitsAfterDot ($n, $rounding_mode, $precision, $counting_mode, $expected) {
        $this->assertSame ($expected, Exchange::decimalToPrecision ($n, $rounding_mode, $precision, $counting_mode));
    }

    public function truncationToNDigitsAfterDot () {
        Exchange::sum(); // hack for constants :|
        return [
            ['12.3456000', TRUNCATE, 100, AFTER_POINT,  '12.3456'],
            ['12.3456',    TRUNCATE, 100, AFTER_POINT,  '12.3456'],
            ['12.3456',    TRUNCATE,   4, AFTER_POINT,  '12.3456'],
            ['12.3456',    TRUNCATE,   3, AFTER_POINT,  '12.345'],
            ['12.3456',    TRUNCATE,   2, AFTER_POINT,  '12.34'],
            ['12.3456',    TRUNCATE,   1, AFTER_POINT,  '12.3'],
            ['12.3456',    TRUNCATE,   0, AFTER_POINT,  '12'],
//            ['12.3456',    TRUNCATE,  -1, AFTER_POINT,  '10'],   // not yet supported
//            ['123.456',    TRUNCATE,  -2, AFTER_POINT,  '120'],  // not yet supported
//            ['123.456',    TRUNCATE,  -3, AFTER_POINT,  '100'],  // not yet supported
        ];
    }

    /**
     * @dataProvider truncationToNSignificantDigits
     */
    public function testDecimalToPrecisionTruncationToNSignificantDigits ($n, $rounding_mode, $precision, $counting_mode, $padding_mode, $expected) {
        $this->assertSame ($expected, Exchange::decimalToPrecision ($n, $rounding_mode, $precision, $padding_mode, $counting_mode));
    }

    public function truncationToNSignificantDigits () {
        return [
            ['0.000123456700', TRUNCATE, 100, SIGNIFICANT_DIGITS,    NO_PADDING, '0.0001234567'],
            ['0.0001234567',   TRUNCATE, 100, SIGNIFICANT_DIGITS,    NO_PADDING, '0.0001234567'],
            ['0.0001234567',   TRUNCATE,   7, SIGNIFICANT_DIGITS,    NO_PADDING, '0.0001234567'],

            ['0.000123456',    TRUNCATE,   6, SIGNIFICANT_DIGITS,    NO_PADDING, '0.000123456'],
            ['0.00012345',     TRUNCATE,   5, SIGNIFICANT_DIGITS,    NO_PADDING, '0.00012345'],
            ['0.00012',        TRUNCATE,   2, SIGNIFICANT_DIGITS,    NO_PADDING, '0.00012'],
            ['0.0001',         TRUNCATE,   1, SIGNIFICANT_DIGITS,    NO_PADDING, '0.0001'],

            ['123.0000987654', TRUNCATE,  10, SIGNIFICANT_DIGITS,    NO_PADDING, '123.0000987'],
            ['123.0000987654', TRUNCATE,   8, SIGNIFICANT_DIGITS,    NO_PADDING, '123.00009'],
            ['123.0000987654', TRUNCATE,   7, SIGNIFICANT_DIGITS,    NO_PADDING, '123'],
            ['123.0000987654', TRUNCATE,   7, SIGNIFICANT_DIGITS, PAD_WITH_ZERO, '123.0000'],
            ['123.0000987654', TRUNCATE,   4, SIGNIFICANT_DIGITS, PAD_WITH_ZERO, '123.0'],

            ['123.0000987654', TRUNCATE,   2, SIGNIFICANT_DIGITS,    NO_PADDING, '120'],
            ['123.0000987654', TRUNCATE,   1, SIGNIFICANT_DIGITS,    NO_PADDING, '100'],
            ['123.0000987654', TRUNCATE,   1, SIGNIFICANT_DIGITS, PAD_WITH_ZERO, '100'],
        ];
    }

    /**
     * @dataProvider roundingToNDigitsAfterDot
     */
    public function testDecimalToPrecisionRoundingToNDigitsAfterDot ($n, $rounding_mode, $precision, $counting_mode, $padding_mode, $expected) {
        $this->assertSame ($expected, Exchange::decimalToPrecision ($n, $rounding_mode, $precision, $padding_mode, $counting_mode));
    }

    public function roundingToNDigitsAfterDot () {
        return [
            ['12.3456000', ROUND, 100, AFTER_POINT,    NO_PADDING,  '12.3456'],
            ['12.3456',    ROUND, 100, AFTER_POINT,    NO_PADDING,  '12.3456'],
            ['12.3456',    ROUND,   4, AFTER_POINT,    NO_PADDING,  '12.3456'],
            ['12.3456',    ROUND,   3, AFTER_POINT,    NO_PADDING,  '12.346'],
            ['12.3456',    ROUND,   2, AFTER_POINT,    NO_PADDING,  '12.35'],
            ['12.3456',    ROUND,   1, AFTER_POINT,    NO_PADDING,  '12.3'],
            ['12.3456',    ROUND,   0, AFTER_POINT,    NO_PADDING,  '12'],
//            ['12.3456',    ROUND,  -1, AFTER_POINT,    NO_PADDING,  '10'],  // not yet supported
//            ['123.456',    ROUND,  -1, AFTER_POINT,    NO_PADDING,  '120'],  // not yet supported
//            ['123.456',    ROUND,  -2, AFTER_POINT,    NO_PADDING,  '100'],  // not yet supported

            [ '9.999',     ROUND,   3, AFTER_POINT,    NO_PADDING,  '9.999'],
            [ '9.999',     ROUND,   2, AFTER_POINT,    NO_PADDING,  '10'],
            [ '9.999',     ROUND,   2, AFTER_POINT, PAD_WITH_ZERO,  '10.00'],
            [ '99.999',    ROUND,   2, AFTER_POINT, PAD_WITH_ZERO,  '100.00'],
            ['-99.999',    ROUND,   2, AFTER_POINT, PAD_WITH_ZERO, '-100.00'],
        ];
    }

    /**
     * @dataProvider roundingToNSignificantDigits
     */
    public function testDecimalToPrecisionRoundingToNSignificantDigits ($n, $rounding_mode, $precision, $counting_mode, $padding_mode, $expected) {
        $this->assertSame ($expected, Exchange::decimalToPrecision ($n, $rounding_mode, $precision, $padding_mode, $counting_mode));
    }

    public function roundingToNSignificantDigits () {
        return [
            ['0.000123456700', ROUND, 100, SIGNIFICANT_DIGITS,    NO_PADDING, '0.0001234567'],
            ['0.0001234567',   ROUND, 100, SIGNIFICANT_DIGITS,    NO_PADDING, '0.0001234567'],
            ['0.0001234567',   ROUND,   7, SIGNIFICANT_DIGITS,    NO_PADDING, '0.0001234567'],

            ['0.000123456',    ROUND,   6, SIGNIFICANT_DIGITS,    NO_PADDING, '0.000123456'],
            ['0.000123456',    ROUND,   5, SIGNIFICANT_DIGITS,    NO_PADDING, '0.00012346'],
            ['0.000123456',    ROUND,   4, SIGNIFICANT_DIGITS,    NO_PADDING, '0.0001235'],
            ['0.00012',        ROUND,   2, SIGNIFICANT_DIGITS,    NO_PADDING, '0.00012'],
            ['0.0001',         ROUND,   1, SIGNIFICANT_DIGITS,    NO_PADDING, '0.0001'],

            ['123.0000987654', ROUND,   7, SIGNIFICANT_DIGITS,    NO_PADDING, '123.0001'],
            ['123.0000987654', ROUND,   6, SIGNIFICANT_DIGITS,    NO_PADDING, '123'],

            ['0.00098765',     ROUND,   2, SIGNIFICANT_DIGITS,    NO_PADDING, '0.00099'],
            ['0.00098765',     ROUND,   2, SIGNIFICANT_DIGITS, PAD_WITH_ZERO, '0.00099'],

            ['0.00098765',     ROUND,   1, SIGNIFICANT_DIGITS,    NO_PADDING, '0.001'],
            ['0.00098765',     ROUND,  10, SIGNIFICANT_DIGITS, PAD_WITH_ZERO, '0.0009876500000'],

            ['0.098765',       ROUND,   1, SIGNIFICANT_DIGITS, PAD_WITH_ZERO, '0.1'],
        ];
    }

    /**
     * @dataProvider negativeNumbers
     */
    public function testDecimalToPrecisionNegativeNumbers ($n, $rounding_mode, $precision, $counting_mode, $expected) {
        $this->assertSame ($expected, Exchange::decimalToPrecision ($n, $rounding_mode, $precision, $counting_mode));
    }

    public function negativeNumbers () {
        return [
            ['-0.123456', TRUNCATE, 5, AFTER_POINT, '-0.12345'],
            ['-0.123456', ROUND,    5, AFTER_POINT, '-0.12346'],
        ];
    }
}
