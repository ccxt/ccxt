package util

import "testing"

func TestNumberToString(t *testing.T) {
	expected := map[float64]string{
		-7.9e-7: "-0.00000079",
		7.9e-7:  "0.00000079",
		-12.345: "-12.345",
		36e20:   "3600000000000000000000",
		0:       "0",
	}

	for f, v := range expected {
		if NumberToString(f) != v {
			t.Errorf("\nexpected: %s\n     got: %s", v, NumberToString(f))
		}
	}
}

func TestDecimalToPrecision(t *testing.T) {
	var test = func(expectedErr error, expectedResult string, f float64, mode, precision, precisionFirstDigit, padding int) {
		if r, err := DecimalToPrecision(f, mode, precision, precisionFirstDigit, padding); err != expectedErr {
			t.Errorf("%d%d%d:%3d: %s", mode, precisionFirstDigit, padding, precision, expectedResult)
			t.Errorf("    err: got %s, expected %s", err, expectedErr)
		} else if r != expectedResult {
			t.Errorf("%d%d%d:%3d: %s", mode, precisionFirstDigit, padding, precision, expectedResult)
			t.Errorf("      -> %s", r)
		}
	}

	// decimalToPrecision: truncation (to N digits after dot)
	test(nil, "12.3456", 12.3456, Truncate, 100, DecimalPlaces, NoPadding)
	test(nil, "12.3456", 12.3456000, Truncate, 100, DecimalPlaces, NoPadding)
	test(nil, "12.3456", 12.3456, Truncate, 100, DecimalPlaces, NoPadding)
	test(nil, "12.3456", 12.3456, Truncate, 4, DecimalPlaces, NoPadding)
	test(nil, "12.345", 12.3456, Truncate, 3, DecimalPlaces, NoPadding)
	test(nil, "12.34", 12.3456, Truncate, 2, DecimalPlaces, NoPadding)
	test(nil, "12.3", 12.3456, Truncate, 1, DecimalPlaces, NoPadding)
	test(nil, "12", 12.3456, Truncate, 0, DecimalPlaces, NoPadding)
	test(nil, "0", 0, Truncate, 0, DecimalPlaces, NoPadding)

	// decimalToPrecision: truncation (to N significant digits)
	test(nil, "0.0001234567", 0.000123456700, Truncate, 100, SignificantDigits, NoPadding)
	test(nil, "0.0001234567", 0.0001234567, Truncate, 100, SignificantDigits, NoPadding)
	test(nil, "0.0001234567", 0.0001234567, Truncate, 7, SignificantDigits, NoPadding)
	test(nil, "0.000123456", 0.000123456, Truncate, 6, SignificantDigits, NoPadding)
	test(nil, "0.00012345", 0.000123456, Truncate, 5, SignificantDigits, NoPadding)
	test(nil, "0.00012", 0.000123456, Truncate, 2, SignificantDigits, NoPadding)
	test(nil, "0.0001", 0.000123456, Truncate, 1, SignificantDigits, NoPadding)
	test(nil, "123.0000987", 123.0000987654, Truncate, 10, SignificantDigits, NoPadding)
	test(nil, "123.00009", 123.0000987654, Truncate, 8, SignificantDigits, NoPadding)
	test(nil, "123", 123.0000987654, Truncate, 7, SignificantDigits, NoPadding)
	test(nil, "123.0000", 123.0000987654, Truncate, 7, SignificantDigits, PadWithZero)
	test(nil, "123.0", 123.0000987654, Truncate, 4, SignificantDigits, PadWithZero)
	test(nil, "120", 123.0000987654, Truncate, 2, SignificantDigits, NoPadding)
	test(nil, "100", 123.0000987654, Truncate, 1, SignificantDigits, NoPadding)
	test(nil, "100", 123.0000987654, Truncate, 1, SignificantDigits, PadWithZero)
	test(nil, "0", 0, Truncate, 0, SignificantDigits, NoPadding)

	// decimalToPrecision: rounding (to N digits after dot)
	test(nil, "12.3456", 12.3456000, Round, 100, DecimalPlaces, NoPadding)
	test(nil, "12.3456", 12.3456, Round, 100, DecimalPlaces, NoPadding)
	test(nil, "12.3456", 12.3456, Round, 4, DecimalPlaces, NoPadding)
	test(nil, "12.346", 12.3456, Round, 3, DecimalPlaces, NoPadding)
	test(nil, "12.35", 12.3456, Round, 2, DecimalPlaces, NoPadding)
	test(nil, "12.3", 12.3456, Round, 1, DecimalPlaces, NoPadding)
	test(nil, "12", 12.3456, Round, 0, DecimalPlaces, NoPadding)
	test(nil, "9.999", 9.999, Round, 3, DecimalPlaces, NoPadding)
	test(nil, "10", 9.999, Round, 2, DecimalPlaces, NoPadding)
	test(nil, "10.00", 9.999, Round, 2, DecimalPlaces, PadWithZero)
	test(nil, "100.00", 99.999, Round, 2, DecimalPlaces, PadWithZero)
	test(nil, "-100.00", -99.999, Round, 2, DecimalPlaces, PadWithZero)

	// decimalToPrecision: rounding (to N significant digits)
	test(nil, "0.0001234567", 0.000123456700, Round, 100, SignificantDigits, NoPadding)
	test(nil, "0.0001234567", 0.0001234567, Round, 100, SignificantDigits, NoPadding)
	test(nil, "0.0001234567", 0.0001234567, Round, 7, SignificantDigits, NoPadding)
	test(nil, "0.000123456", 0.000123456, Round, 6, SignificantDigits, NoPadding)
	test(nil, "0.00012346", 0.000123456, Round, 5, SignificantDigits, NoPadding)
	test(nil, "0.0001235", 0.000123456, Round, 4, SignificantDigits, NoPadding)
	test(nil, "0.00012", 0.00012, Round, 2, SignificantDigits, NoPadding)
	test(nil, "0.0001", 0.0001, Round, 1, SignificantDigits, NoPadding)
	test(nil, "123.0001", 123.0000987654, Round, 7, SignificantDigits, NoPadding)
	test(nil, "123", 123.0000987654, Round, 6, SignificantDigits, NoPadding)
	test(nil, "0.00099", 0.00098765, Round, 2, SignificantDigits, NoPadding)
	test(nil, "0.00099", 0.00098765, Round, 2, SignificantDigits, PadWithZero)
	test(nil, "0.001", 0.00098765, Round, 1, SignificantDigits, NoPadding)
	test(nil, "0.0009876500000", 0.00098765, Round, 10, SignificantDigits, PadWithZero)
	test(nil, "0.1", 0.098765, Round, 1, SignificantDigits, PadWithZero)
	test(nil, "0", 0, Round, 0, SignificantDigits, NoPadding)

	// decimalToPrecision: negative numbers
	test(nil, "-0.12345", -0.123456, Truncate, 5, DecimalPlaces, NoPadding)
	test(nil, "-0.12346", -0.123456, Round, 5, DecimalPlaces, NoPadding)

	// decimalToPrecision: without dot / trailing dot
	test(nil, "123", 123, Truncate, 0, DecimalPlaces, NoPadding)
	test(nil, "123", 123, Truncate, 5, DecimalPlaces, NoPadding)
	test(nil, "123.00000", 123, Truncate, 5, DecimalPlaces, PadWithZero)
	test(nil, "123", 123., Truncate, 0, DecimalPlaces, NoPadding)
	test(nil, "123.00000", 123., Truncate, 5, DecimalPlaces, PadWithZero)
	test(nil, "0", 0., Truncate, 0, DecimalPlaces, NoPadding)
	test(nil, "0.00000", 0., Truncate, 5, DecimalPlaces, PadWithZero)

	// decimalToPrecision: rounding for equidistant digits
	test(nil, "1.4", 1.44, Round, 1, DecimalPlaces, NoPadding)
	test(nil, "1.5", 1.45, Round, 1, DecimalPlaces, NoPadding)
	test(nil, "1", 1.45, Round, 0, DecimalPlaces, NoPadding)
}
