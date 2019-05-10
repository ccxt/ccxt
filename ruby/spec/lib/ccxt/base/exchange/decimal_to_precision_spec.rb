require 'spec_helper'
require 'ccxt'

RSpec.describe Ccxt::Exchange do
  TRUNCATE = 0; ROUND = 1; DECIMAL_PLACES = 2; SIGNIFICANT_DIGITS = 3; NO_PADDING = 4; PAD_WITH_ZERO = 5

  context '.decimal_to_precision' do
    it 'test_decimal_to_precision_truncation_to_n_digits_after_dot' do
      expect(Ccxt::Exchange.decimal_to_precision('12.3456000', TRUNCATE, 100, DECIMAL_PLACES)).to eq '12.3456'
      expect(Ccxt::Exchange.decimal_to_precision('12.3456', TRUNCATE, 100, DECIMAL_PLACES)).to eq '12.3456'
      expect(Ccxt::Exchange.decimal_to_precision('12.3456', TRUNCATE, 4, DECIMAL_PLACES)).to eq '12.3456'
      expect(Ccxt::Exchange.decimal_to_precision('12.3456', TRUNCATE, 3, DECIMAL_PLACES)).to eq '12.345'
      expect(Ccxt::Exchange.decimal_to_precision('12.3456', TRUNCATE, 2, DECIMAL_PLACES)).to eq '12.34'
      expect(Ccxt::Exchange.decimal_to_precision('12.3456', TRUNCATE, 1, DECIMAL_PLACES)).to eq '12.3'
      expect(Ccxt::Exchange.decimal_to_precision('12.3456', TRUNCATE, 0, DECIMAL_PLACES)).to eq '12'

      expect(Ccxt::Exchange.decimal_to_precision('0.0000001', TRUNCATE, 8, DECIMAL_PLACES)).to eq '0.0000001'
      expect(Ccxt::Exchange.decimal_to_precision('0.00000001', TRUNCATE, 8, DECIMAL_PLACES)).to eq '0.00000001'

      expect(Ccxt::Exchange.decimal_to_precision('0.000000000', TRUNCATE, 9, DECIMAL_PLACES, PAD_WITH_ZERO)).to eq '0.000000000'
      expect(Ccxt::Exchange.decimal_to_precision('0.000000001', TRUNCATE, 9, DECIMAL_PLACES, PAD_WITH_ZERO)).to eq '0.000000001'

      expect(Ccxt::Exchange.decimal_to_precision('12.3456', TRUNCATE, -1, DECIMAL_PLACES)).to eq '10'
      expect(Ccxt::Exchange.decimal_to_precision('123.456', TRUNCATE, -1, DECIMAL_PLACES)).to eq '120'
      expect(Ccxt::Exchange.decimal_to_precision('123.456', TRUNCATE, -2, DECIMAL_PLACES)).to eq '100'
      expect(Ccxt::Exchange.decimal_to_precision('9.99999', TRUNCATE, -1, DECIMAL_PLACES)).to eq '0'
      expect(Ccxt::Exchange.decimal_to_precision('99.9999', TRUNCATE, -1, DECIMAL_PLACES)).to eq '90'
      expect(Ccxt::Exchange.decimal_to_precision('99.9999', TRUNCATE, -2, DECIMAL_PLACES)).to eq '0'

      expect(Ccxt::Exchange.decimal_to_precision('0', TRUNCATE, 0, DECIMAL_PLACES)).to eq '0'
      expect(Ccxt::Exchange.decimal_to_precision('-0.9', TRUNCATE, 0, DECIMAL_PLACES)).to eq '0'
    end

    # testDecimalToPrecisionTruncationToNSignificantDigits
    it 'test_decimal_to_precision_truncation_to_n_significant_digits' do
      expect(Ccxt::Exchange.decimal_to_precision('0.000123456700', TRUNCATE, 100, SIGNIFICANT_DIGITS)).to eq '0.0001234567'
      expect(Ccxt::Exchange.decimal_to_precision('0.0001234567', TRUNCATE, 100, SIGNIFICANT_DIGITS)).to eq '0.0001234567'
      expect(Ccxt::Exchange.decimal_to_precision('0.0001234567', TRUNCATE, 7, SIGNIFICANT_DIGITS)).to eq '0.0001234567'

      expect(Ccxt::Exchange.decimal_to_precision('0.000123456', TRUNCATE, 6, SIGNIFICANT_DIGITS)).to eq '0.000123456'
      expect(Ccxt::Exchange.decimal_to_precision('0.000123456', TRUNCATE, 5, SIGNIFICANT_DIGITS)).to eq '0.00012345'
      expect(Ccxt::Exchange.decimal_to_precision('0.000123456', TRUNCATE, 2, SIGNIFICANT_DIGITS)).to eq '0.00012'
      expect(Ccxt::Exchange.decimal_to_precision('0.000123456', TRUNCATE, 1, SIGNIFICANT_DIGITS)).to eq '0.0001'

      expect(Ccxt::Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 10, SIGNIFICANT_DIGITS, PAD_WITH_ZERO)).to eq '123.0000987'
      expect(Ccxt::Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 8, SIGNIFICANT_DIGITS)).to eq '123.00009'
      expect(Ccxt::Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 7, SIGNIFICANT_DIGITS, PAD_WITH_ZERO)).to eq '123.0000'
      expect(Ccxt::Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 6, SIGNIFICANT_DIGITS)).to eq '123'
      expect(Ccxt::Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 5, SIGNIFICANT_DIGITS, PAD_WITH_ZERO)).to eq '123.00'
      expect(Ccxt::Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 4, SIGNIFICANT_DIGITS)).to eq '123'
      expect(Ccxt::Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 4, SIGNIFICANT_DIGITS, PAD_WITH_ZERO)).to eq '123.0'
      expect(Ccxt::Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 3, SIGNIFICANT_DIGITS, PAD_WITH_ZERO)).to eq '123'
      expect(Ccxt::Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 2, SIGNIFICANT_DIGITS)).to eq '120'
      expect(Ccxt::Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 1, SIGNIFICANT_DIGITS)).to eq '100'
      expect(Ccxt::Exchange.decimal_to_precision('123.0000987654', TRUNCATE, 1, SIGNIFICANT_DIGITS, PAD_WITH_ZERO)).to eq '100'

      expect(Ccxt::Exchange.decimal_to_precision('1234', TRUNCATE, 5, SIGNIFICANT_DIGITS)).to eq '1234'
      expect(Ccxt::Exchange.decimal_to_precision('1234', TRUNCATE, 5, SIGNIFICANT_DIGITS, PAD_WITH_ZERO)).to eq '1234.0'
      expect(Ccxt::Exchange.decimal_to_precision('1234', TRUNCATE, 4, SIGNIFICANT_DIGITS)).to eq '1234'
      expect(Ccxt::Exchange.decimal_to_precision('1234', TRUNCATE, 4, SIGNIFICANT_DIGITS, PAD_WITH_ZERO)).to eq '1234'
      expect(Ccxt::Exchange.decimal_to_precision('1234.69', TRUNCATE, 0, SIGNIFICANT_DIGITS)).to eq '0'
      expect(Ccxt::Exchange.decimal_to_precision('1234.69', TRUNCATE, 0, SIGNIFICANT_DIGITS, PAD_WITH_ZERO)).to eq '0'
    end

    # testDecimalToPrecisionRoundingToNDigitsAfterDot
    it 'test_decimal_to_precision_rounding_to_n_digits_after_dot' do
      expect(Ccxt::Exchange.decimal_to_precision('12.3456000', ROUND, 100, DECIMAL_PLACES)).to eq '12.3456'
      expect(Ccxt::Exchange.decimal_to_precision('12.3456', ROUND, 100, DECIMAL_PLACES)).to eq '12.3456'
      expect(Ccxt::Exchange.decimal_to_precision('12.3456', ROUND, 4, DECIMAL_PLACES)).to eq '12.3456'
      expect(Ccxt::Exchange.decimal_to_precision('12.3456', ROUND, 3, DECIMAL_PLACES)).to eq '12.346'
      expect(Ccxt::Exchange.decimal_to_precision('12.3456', ROUND, 2, DECIMAL_PLACES)).to eq '12.35'
      expect(Ccxt::Exchange.decimal_to_precision('12.3456', ROUND, 1, DECIMAL_PLACES)).to eq '12.3'
      expect(Ccxt::Exchange.decimal_to_precision('12.3456', ROUND, 0, DECIMAL_PLACES)).to eq '12'
    end

    # a problematic case in PHP
    it 'test_problematic_case_in_php' do
      expect(Ccxt::Exchange.decimal_to_precision('10000', ROUND, 6, DECIMAL_PLACES)).to eq '10000'
      expect(Ccxt::Exchange.decimal_to_precision('0.00003186', ROUND, 8, DECIMAL_PLACES)).to eq '0.00003186'

      expect(Ccxt::Exchange.decimal_to_precision('12.3456', ROUND, -1, DECIMAL_PLACES)).to eq '10'
      expect(Ccxt::Exchange.decimal_to_precision('123.456', ROUND, -1, DECIMAL_PLACES)).to eq '120'
      expect(Ccxt::Exchange.decimal_to_precision('123.456', ROUND, -2, DECIMAL_PLACES)).to eq '100'
      expect(Ccxt::Exchange.decimal_to_precision('9.99999', ROUND, -1, DECIMAL_PLACES)).to eq '10'
      expect(Ccxt::Exchange.decimal_to_precision('99.9999', ROUND, -1, DECIMAL_PLACES)).to eq '100'
      expect(Ccxt::Exchange.decimal_to_precision('99.9999', ROUND, -2, DECIMAL_PLACES)).to eq '100'

      expect(Ccxt::Exchange.decimal_to_precision('9.999', ROUND, 3, DECIMAL_PLACES)).to eq '9.999'
      expect(Ccxt::Exchange.decimal_to_precision('9.999', ROUND, 2, DECIMAL_PLACES)).to eq '10'
      expect(Ccxt::Exchange.decimal_to_precision('9.999', ROUND, 2, DECIMAL_PLACES, PAD_WITH_ZERO)).to eq '10.00'
      expect(Ccxt::Exchange.decimal_to_precision('99.999', ROUND, 2, DECIMAL_PLACES, PAD_WITH_ZERO)).to eq '100.00'
      expect(Ccxt::Exchange.decimal_to_precision('-99.999', ROUND, 2, DECIMAL_PLACES, PAD_WITH_ZERO)).to eq '-100.00'
    end

    # testDecimalToPrecisionRoundingToNSignificantDigits
    it 'test_decimal_to_precision_rounding_to_n_significant_digits' do
      expect(Ccxt::Exchange.decimal_to_precision('0.000123456700', ROUND, 100, SIGNIFICANT_DIGITS)).to eq '0.0001234567'
      expect(Ccxt::Exchange.decimal_to_precision('0.0001234567', ROUND, 100, SIGNIFICANT_DIGITS)).to eq '0.0001234567'
      expect(Ccxt::Exchange.decimal_to_precision('0.0001234567', ROUND, 7, SIGNIFICANT_DIGITS)).to eq '0.0001234567'

      expect(Ccxt::Exchange.decimal_to_precision('0.000123456', ROUND, 6, SIGNIFICANT_DIGITS)).to eq '0.000123456'
      expect(Ccxt::Exchange.decimal_to_precision('0.000123456', ROUND, 5, SIGNIFICANT_DIGITS)).to eq '0.00012346'
      expect(Ccxt::Exchange.decimal_to_precision('0.000123456', ROUND, 4, SIGNIFICANT_DIGITS)).to eq '0.0001235'
      expect(Ccxt::Exchange.decimal_to_precision('0.00012', ROUND, 2, SIGNIFICANT_DIGITS)).to eq '0.00012'
      expect(Ccxt::Exchange.decimal_to_precision('0.0001', ROUND, 1, SIGNIFICANT_DIGITS)).to eq '0.0001'

      expect(Ccxt::Exchange.decimal_to_precision('123.0000987654', ROUND, 7, SIGNIFICANT_DIGITS)).to eq '123.0001'
      expect(Ccxt::Exchange.decimal_to_precision('123.0000987654', ROUND, 6, SIGNIFICANT_DIGITS)).to eq '123'

      expect(Ccxt::Exchange.decimal_to_precision('0.00098765', ROUND, 2, SIGNIFICANT_DIGITS)).to eq '0.00099'
      expect(Ccxt::Exchange.decimal_to_precision('0.00098765', ROUND, 2, SIGNIFICANT_DIGITS, PAD_WITH_ZERO)).to eq '0.00099'

      expect(Ccxt::Exchange.decimal_to_precision('0.00098765', ROUND, 1, SIGNIFICANT_DIGITS)).to eq '0.001'
      expect(Ccxt::Exchange.decimal_to_precision('0.00098765', ROUND, 10, SIGNIFICANT_DIGITS, PAD_WITH_ZERO)).to eq '0.0009876500000'

      expect(Ccxt::Exchange.decimal_to_precision('0.098765', ROUND, 1, SIGNIFICANT_DIGITS, PAD_WITH_ZERO)).to eq '0.1'

      expect(Ccxt::Exchange.decimal_to_precision('0', ROUND, 0, SIGNIFICANT_DIGITS)).to eq '0'
      expect(Ccxt::Exchange.decimal_to_precision('-0.123', ROUND, 0, SIGNIFICANT_DIGITS)).to eq '0'
    end

      # testDecimalToPrecisionNegativeNumbers
    it 'test_decimal_to_precision_negative_numbers' do
      expect(Ccxt::Exchange.decimal_to_precision('-0.123456', TRUNCATE, 5, DECIMAL_PLACES)).to eq '-0.12345'
      expect(Ccxt::Exchange.decimal_to_precision('-0.123456', ROUND, 5, DECIMAL_PLACES)).to eq '-0.12346'
    end

    # decimal_to_precision: without dot / trailing dot
    it 'test_decimal_to_precision_without_dot_or_trailing_dot' do
      expect(Ccxt::Exchange.decimal_to_precision('123', TRUNCATE, 0)).to eq '123'

      expect(Ccxt::Exchange.decimal_to_precision('123', TRUNCATE, 5, DECIMAL_PLACES)).to eq '123'
      expect(Ccxt::Exchange.decimal_to_precision('123', TRUNCATE, 5, DECIMAL_PLACES, PAD_WITH_ZERO)).to eq '123.00000'

      expect(Ccxt::Exchange.decimal_to_precision('123.', TRUNCATE, 0, DECIMAL_PLACES)).to eq '123'
      expect(Ccxt::Exchange.decimal_to_precision('123.', TRUNCATE, 5, DECIMAL_PLACES, PAD_WITH_ZERO)).to eq '123.00000'

      expect(Ccxt::Exchange.decimal_to_precision('0.', TRUNCATE, 0)).to eq '0'
      expect(Ccxt::Exchange.decimal_to_precision('0.', TRUNCATE, 5, DECIMAL_PLACES, PAD_WITH_ZERO)).to eq '0.00000'
    end

    # decimal_to_precision: rounding for equidistant digits
    it 'test_decimal_to_precision_rounding_for_equidistant_digits' do
      expect(Ccxt::Exchange.decimal_to_precision('1.44', ROUND, 1, DECIMAL_PLACES)).to eq '1.4'
      expect(Ccxt::Exchange.decimal_to_precision('1.45', ROUND, 1, DECIMAL_PLACES)).to eq '1.5'
      expect(Ccxt::Exchange.decimal_to_precision('1.45', ROUND, 0, DECIMAL_PLACES)).to eq '1'  # not 2
    end

    # ----------------------------------------------------------------------------
    # negative precision only implemented so far in python
    # pretty useless for decimal applications as anything |x| < 5 == 0
    # NO_PADDING and PAD_WITH_ZERO are ignored
    it 'test_decimal_to_precision_negative_precision' do
      expect(Ccxt::Exchange.decimal_to_precision('5', ROUND, -1, DECIMAL_PLACES)).to eq '10'
      expect(Ccxt::Exchange.decimal_to_precision('4.999', ROUND, -1, DECIMAL_PLACES)).to eq '0'
      expect(Ccxt::Exchange.decimal_to_precision('0.0431531423', ROUND, -1, DECIMAL_PLACES)).to eq '0'
      expect(Ccxt::Exchange.decimal_to_precision('-69.3', ROUND, -1, DECIMAL_PLACES)).to eq '-70'
      expect(Ccxt::Exchange.decimal_to_precision('5001', ROUND, -4, DECIMAL_PLACES)).to eq '10000'
      expect(Ccxt::Exchange.decimal_to_precision('4999.999', ROUND, -4, DECIMAL_PLACES)).to eq '0'

      expect(Ccxt::Exchange.decimal_to_precision('69.3', TRUNCATE, -2, DECIMAL_PLACES)).to eq '0'
      expect(Ccxt::Exchange.decimal_to_precision('-69.3', TRUNCATE, -2, DECIMAL_PLACES)).to eq '0'
      expect(Ccxt::Exchange.decimal_to_precision('69.3', TRUNCATE, -1, SIGNIFICANT_DIGITS)).to eq '60'
      expect(Ccxt::Exchange.decimal_to_precision('-69.3', TRUNCATE, -1, SIGNIFICANT_DIGITS)).to eq '-60'
      expect(Ccxt::Exchange.decimal_to_precision('69.3', TRUNCATE, -2, SIGNIFICANT_DIGITS)).to eq '0'
    end
  end
end
