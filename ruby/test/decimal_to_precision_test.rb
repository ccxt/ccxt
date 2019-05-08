require "test_helper"
require_relative '../lib/ccxt/base/exchange.rb'

class DecimalToPrecisionTest < MiniTest::Test
  TRUNCATE = 0; ROUND = 1; DECIMAL_PLACES = 2; SIGNIFICANT_DIGITS = 3; NO_PADDING = 4; PAD_WITH_ZERO = 5
  
  def test_number_to_string
    assert_equal Exchange.number_to_string(-7.8e-7), '-0.00000078'
    assert_equal Exchange.number_to_string(7.8e-7), '0.00000078'
    assert_equal Exchange.number_to_string(-17.805e-7), '-0.0000017805'
    assert_equal Exchange.number_to_string(17.805e-7), '0.0000017805'
    assert_equal Exchange.number_to_string(-7.0005e27), '-7000500000000000000000000000'
    assert_equal Exchange.number_to_string(7.0005e27), '7000500000000000000000000000'
    assert_equal Exchange.number_to_string(-7.9e27), '-7900000000000000000000000000'
    assert_equal Exchange.number_to_string(7.9e27), '7900000000000000000000000000'
    assert_equal Exchange.number_to_string(-12.345), '-12.345'
    assert_equal Exchange.number_to_string(12.345), '12.345'
    assert_equal Exchange.number_to_string(0), '0'
  end
  
  def test_decimal_to_precision_truncation_to_n_digits_after_dot
    assert_equal Exchange.decimal_to_precision('12.3456000', TRUNCATE, 100, DECIMAL_PLACES), '12.3456'
    assert_equal Exchange.decimal_to_precision('12.3456', TRUNCATE, 100, DECIMAL_PLACES), '12.3456'
    assert_equal Exchange.decimal_to_precision('12.3456', TRUNCATE, 4, DECIMAL_PLACES), '12.3456'
    assert_equal Exchange.decimal_to_precision('12.3456', TRUNCATE, 3, DECIMAL_PLACES), '12.345'
    assert_equal Exchange.decimal_to_precision('12.3456', TRUNCATE, 2, DECIMAL_PLACES), '12.34'
    assert_equal Exchange.decimal_to_precision('12.3456', TRUNCATE, 1, DECIMAL_PLACES), '12.3'
    assert_equal Exchange.decimal_to_precision('12.3456', TRUNCATE, 0, DECIMAL_PLACES), '12'

    assert_equal Exchange.decimal_to_precision('0.0000001', TRUNCATE, 8, DECIMAL_PLACES), '0.0000001'
    assert_equal Exchange.decimal_to_precision('0.00000001', TRUNCATE, 8, DECIMAL_PLACES), '0.00000001'

    assert_equal Exchange.decimal_to_precision('0.000000000', TRUNCATE, 9, DECIMAL_PLACES, PAD_WITH_ZERO), '0.000000000'
    assert_equal Exchange.decimal_to_precision('0.000000001', TRUNCATE, 9, DECIMAL_PLACES, PAD_WITH_ZERO), '0.000000001'

    assert_equal Exchange.decimal_to_precision('12.3456', TRUNCATE, -1, DECIMAL_PLACES), '10'
    assert_equal Exchange.decimal_to_precision('123.456', TRUNCATE, -1, DECIMAL_PLACES), '120'
    assert_equal Exchange.decimal_to_precision('123.456', TRUNCATE, -2, DECIMAL_PLACES), '100'
    assert_equal Exchange.decimal_to_precision('9.99999', TRUNCATE, -1, DECIMAL_PLACES), '0'
    assert_equal Exchange.decimal_to_precision('99.9999', TRUNCATE, -1, DECIMAL_PLACES), '90'
    assert_equal Exchange.decimal_to_precision('99.9999', TRUNCATE, -2, DECIMAL_PLACES), '0'

    assert_equal Exchange.decimal_to_precision('0', TRUNCATE, 0, DECIMAL_PLACES), '0'
    assert_equal Exchange.decimal_to_precision('-0.9', TRUNCATE, 0, DECIMAL_PLACES), '0'
  end
  
  # testDecimalToPrecisionTruncationToNSignificantDigits
  def test_decimal_to_precision_truncation_to_n_significant_digits
    assert_equal Exchange.decimal_to_precision('0.000123456700', TRUNCATE, 100, SIGNIFICANT_DIGITS), '0.0001234567'
    assert_equal Exchange.decimal_to_precision('0.0001234567', TRUNCATE, 100, SIGNIFICANT_DIGITS), '0.0001234567'
    assert_equal Exchange.decimal_to_precision('0.0001234567', TRUNCATE, 7, SIGNIFICANT_DIGITS), '0.0001234567'

    assert_equal Exchange.decimal_to_precision('0.000123456', TRUNCATE, 6, SIGNIFICANT_DIGITS), '0.000123456'
    assert_equal Exchange.decimal_to_precision('0.000123456', TRUNCATE, 5, SIGNIFICANT_DIGITS), '0.00012345'
    assert_equal Exchange.decimal_to_precision('0.000123456', TRUNCATE, 2, SIGNIFICANT_DIGITS), '0.00012'
    assert_equal Exchange.decimal_to_precision('0.000123456', TRUNCATE, 1, SIGNIFICANT_DIGITS), '0.0001'

    assert_equal Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 10, SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '123.0000987'
    assert_equal Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 8, SIGNIFICANT_DIGITS), '123.00009'
    assert_equal Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 7, SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '123.0000'
    assert_equal Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 6, SIGNIFICANT_DIGITS), '123'
    assert_equal Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 5, SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '123.00'
    assert_equal Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 4, SIGNIFICANT_DIGITS), '123'
    assert_equal Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 4, SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '123.0'
    assert_equal Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 3, SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '123'
    assert_equal Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 2, SIGNIFICANT_DIGITS), '120'
    assert_equal Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 1, SIGNIFICANT_DIGITS), '100'
    assert_equal Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 1, SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '100'

    assert_equal Exchange.decimal_to_precision('1234', TRUNCATE, 5, SIGNIFICANT_DIGITS), '1234'
    assert_equal Exchange.decimal_to_precision('1234', TRUNCATE, 5, SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '1234.0'
    assert_equal Exchange.decimal_to_precision('1234', TRUNCATE, 4, SIGNIFICANT_DIGITS), '1234'
    assert_equal Exchange.decimal_to_precision('1234', TRUNCATE, 4, SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '1234'
    assert_equal Exchange.decimal_to_precision('1234.69', TRUNCATE, 0, SIGNIFICANT_DIGITS), '0'
    assert_equal Exchange.decimal_to_precision('1234.69', TRUNCATE, 0, SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '0'
  end

  # testDecimalToPrecisionRoundingToNDigitsAfterDot  
  def test_decimal_to_precision_rounding_to_n_digits_after_dot
    assert_equal Exchange.decimal_to_precision('12.3456000', ROUND, 100, DECIMAL_PLACES), '12.3456'
    assert_equal Exchange.decimal_to_precision('12.3456', ROUND, 100, DECIMAL_PLACES), '12.3456'
    assert_equal Exchange.decimal_to_precision('12.3456', ROUND, 4, DECIMAL_PLACES), '12.3456'
    assert_equal Exchange.decimal_to_precision('12.3456', ROUND, 3, DECIMAL_PLACES), '12.346'
    assert_equal Exchange.decimal_to_precision('12.3456', ROUND, 2, DECIMAL_PLACES), '12.35'
    assert_equal Exchange.decimal_to_precision('12.3456', ROUND, 1, DECIMAL_PLACES), '12.3'
    assert_equal Exchange.decimal_to_precision('12.3456', ROUND, 0, DECIMAL_PLACES), '12'
  end

  # a problematic case in PHP  
  def test_problematic_case_in_php
    assert_equal Exchange.decimal_to_precision('10000', ROUND, 6, DECIMAL_PLACES), '10000'
    assert_equal Exchange.decimal_to_precision('0.00003186', ROUND, 8, DECIMAL_PLACES), '0.00003186'

    assert_equal Exchange.decimal_to_precision('12.3456', ROUND, -1, DECIMAL_PLACES), '10'
    assert_equal Exchange.decimal_to_precision('123.456', ROUND, -1, DECIMAL_PLACES), '120'
    assert_equal Exchange.decimal_to_precision('123.456', ROUND, -2, DECIMAL_PLACES), '100'
    assert_equal Exchange.decimal_to_precision('9.99999', ROUND, -1, DECIMAL_PLACES), '10'
    assert_equal Exchange.decimal_to_precision('99.9999', ROUND, -1, DECIMAL_PLACES), '100'
    assert_equal Exchange.decimal_to_precision('99.9999', ROUND, -2, DECIMAL_PLACES), '100'

    assert_equal Exchange.decimal_to_precision('9.999', ROUND, 3, DECIMAL_PLACES), '9.999'
    assert_equal Exchange.decimal_to_precision('9.999', ROUND, 2, DECIMAL_PLACES), '10'
    assert_equal Exchange.decimal_to_precision('9.999', ROUND, 2, DECIMAL_PLACES, PAD_WITH_ZERO), '10.00'
    assert_equal Exchange.decimal_to_precision('99.999', ROUND, 2, DECIMAL_PLACES, PAD_WITH_ZERO), '100.00'
    assert_equal Exchange.decimal_to_precision('-99.999', ROUND, 2, DECIMAL_PLACES, PAD_WITH_ZERO), '-100.00'
  end
  
  # testDecimalToPrecisionRoundingToNSignificantDigits
  def test_decimal_to_precision_rounding_to_n_significant_digits
    assert_equal Exchange.decimal_to_precision('0.000123456700', ROUND, 100, SIGNIFICANT_DIGITS), '0.0001234567'
    assert_equal Exchange.decimal_to_precision('0.0001234567', ROUND, 100, SIGNIFICANT_DIGITS), '0.0001234567'
    assert_equal Exchange.decimal_to_precision('0.0001234567', ROUND, 7, SIGNIFICANT_DIGITS), '0.0001234567'

    assert_equal Exchange.decimal_to_precision('0.000123456', ROUND, 6, SIGNIFICANT_DIGITS), '0.000123456'
    assert_equal Exchange.decimal_to_precision('0.000123456', ROUND, 5, SIGNIFICANT_DIGITS), '0.00012346'
    assert_equal Exchange.decimal_to_precision('0.000123456', ROUND, 4, SIGNIFICANT_DIGITS), '0.0001235'
    assert_equal Exchange.decimal_to_precision('0.00012', ROUND, 2, SIGNIFICANT_DIGITS), '0.00012'
    assert_equal Exchange.decimal_to_precision('0.0001', ROUND, 1, SIGNIFICANT_DIGITS), '0.0001'

    assert_equal Exchange.decimal_to_precision('123.0000987654', ROUND, 7, SIGNIFICANT_DIGITS), '123.0001'
    assert_equal Exchange.decimal_to_precision('123.0000987654', ROUND, 6, SIGNIFICANT_DIGITS), '123'

    assert_equal Exchange.decimal_to_precision('0.00098765', ROUND, 2, SIGNIFICANT_DIGITS), '0.00099'
    assert_equal Exchange.decimal_to_precision('0.00098765', ROUND, 2, SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '0.00099'

    assert_equal Exchange.decimal_to_precision('0.00098765', ROUND, 1, SIGNIFICANT_DIGITS), '0.001'
    assert_equal Exchange.decimal_to_precision('0.00098765', ROUND, 10, SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '0.0009876500000'

    assert_equal Exchange.decimal_to_precision('0.098765', ROUND, 1, SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '0.1'

    assert_equal Exchange.decimal_to_precision('0', ROUND, 0, SIGNIFICANT_DIGITS), '0'
    assert_equal Exchange.decimal_to_precision('-0.123', ROUND, 0, SIGNIFICANT_DIGITS), '0'
  end
  
    # testDecimalToPrecisionNegativeNumbers
  def test_decimal_to_precision_negative_numbers
    assert_equal Exchange.decimal_to_precision('-0.123456', TRUNCATE, 5, DECIMAL_PLACES), '-0.12345'
    assert_equal Exchange.decimal_to_precision('-0.123456', ROUND, 5, DECIMAL_PLACES), '-0.12346'
  end
  
  # decimal_to_precision: without dot / trailing dot
  def test_decimal_to_precision_without_dot_or_trailing_dot
    assert_equal Exchange.decimal_to_precision('123', TRUNCATE, 0), '123'

    assert_equal Exchange.decimal_to_precision('123', TRUNCATE, 5, DECIMAL_PLACES), '123'
    assert_equal Exchange.decimal_to_precision('123', TRUNCATE, 5, DECIMAL_PLACES, PAD_WITH_ZERO), '123.00000'

    assert_equal Exchange.decimal_to_precision('123.', TRUNCATE, 0, DECIMAL_PLACES), '123'
    assert_equal Exchange.decimal_to_precision('123.', TRUNCATE, 5, DECIMAL_PLACES, PAD_WITH_ZERO), '123.00000'

    assert_equal Exchange.decimal_to_precision('0.', TRUNCATE, 0), '0'
    assert_equal Exchange.decimal_to_precision('0.', TRUNCATE, 5, DECIMAL_PLACES, PAD_WITH_ZERO), '0.00000'
  end
  
  # decimal_to_precision: rounding for equidistant digits
  def test_decimal_to_precision_rounding_for_equidistant_digits
    assert_equal Exchange.decimal_to_precision('1.44', ROUND, 1, DECIMAL_PLACES), '1.4'
    assert_equal Exchange.decimal_to_precision('1.45', ROUND, 1, DECIMAL_PLACES), '1.5'
    assert_equal Exchange.decimal_to_precision('1.45', ROUND, 0, DECIMAL_PLACES), '1'  # not 2
  end

  # ----------------------------------------------------------------------------
  # negative precision only implemented so far in python
  # pretty useless for decimal applications as anything |x| < 5 == 0
  # NO_PADDING and PAD_WITH_ZERO are ignored  
  def test_decimal_to_precision_negative_precision
    assert_equal Exchange.decimal_to_precision('5', ROUND, -1, DECIMAL_PLACES), '10'
    assert_equal Exchange.decimal_to_precision('4.999', ROUND, -1, DECIMAL_PLACES), '0'
    assert_equal Exchange.decimal_to_precision('0.0431531423', ROUND, -1, DECIMAL_PLACES), '0'
    assert_equal Exchange.decimal_to_precision('-69.3', ROUND, -1, DECIMAL_PLACES), '-70'
    assert_equal Exchange.decimal_to_precision('5001', ROUND, -4, DECIMAL_PLACES), '10000'
    assert_equal Exchange.decimal_to_precision('4999.999', ROUND, -4, DECIMAL_PLACES), '0'

    assert_equal Exchange.decimal_to_precision('69.3', TRUNCATE, -2, DECIMAL_PLACES), '0'
    assert_equal Exchange.decimal_to_precision('-69.3', TRUNCATE, -2, DECIMAL_PLACES), '0'
    assert_equal Exchange.decimal_to_precision('69.3', TRUNCATE, -1, SIGNIFICANT_DIGITS), '60'
    assert_equal Exchange.decimal_to_precision('-69.3', TRUNCATE, -1, SIGNIFICANT_DIGITS), '-60'
    assert_equal Exchange.decimal_to_precision('69.3', TRUNCATE, -2, SIGNIFICANT_DIGITS), '0'
  end  
end
