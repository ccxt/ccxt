package ccxt

// Typed counterparts of IsEqual/Add, emitted by the transpiler when TypeScript
// already proves both operands sit in the same scalar family. They skip the
// runtime family dispatch and keep the nullable semantics of the pointer layer:
// an absent value (nil, or a nil *T) equals only another absent value, and an
// absent operand of a concatenation/addition makes the whole result absent.

// scalarString normalizes a string-ish operand to (value, present).
func scalarString(v any) (string, bool) {
	switch s := v.(type) {
	case nil:
		return "", false
	case string:
		return s, true
	case *string:
		if s == nil {
			return "", false
		}
		return *s, true
	}
	return "", false
}

// scalarInt normalizes an int-ish operand to (value, present).
func scalarInt(v any) (int64, bool) {
	switch n := v.(type) {
	case nil:
		return 0, false
	case int:
		return int64(n), true
	case int64:
		return n, true
	case *int:
		if n == nil {
			return 0, false
		}
		return int64(*n), true
	case *int64:
		if n == nil {
			return 0, false
		}
		return *n, true
	}
	return 0, false
}

// scalarFloat normalizes a number-ish operand to (value, present). Integers are
// accepted because a numeric literal transpiles to an untyped Go int.
func scalarFloat(v any) (float64, bool) {
	switch n := v.(type) {
	case nil:
		return 0, false
	case float64:
		return n, true
	case *float64:
		if n == nil {
			return 0, false
		}
		return *n, true
	case int:
		return float64(n), true
	case int64:
		return float64(n), true
	case *int:
		if n == nil {
			return 0, false
		}
		return float64(*n), true
	case *int64:
		if n == nil {
			return 0, false
		}
		return float64(*n), true
	}
	return 0, false
}

// scalarBool normalizes a bool-ish operand to (value, present).
func scalarBool(v any) (bool, bool) {
	switch b := v.(type) {
	case nil:
		return false, false
	case bool:
		return b, true
	case *bool:
		if b == nil {
			return false, false
		}
		return *b, true
	}
	return false, false
}

// IsEqualString compares two string-ish operands. Absent == absent is true,
// absent == present is false.
func IsEqualString(a, b any) bool {
	aVal, aOk := scalarString(a)
	bVal, bOk := scalarString(b)
	if !aOk || !bOk {
		return !aOk && !bOk
	}
	return aVal == bVal
}

// IsEqualInt compares two integer-ish operands.
func IsEqualInt(a, b any) bool {
	aVal, aOk := scalarInt(a)
	bVal, bOk := scalarInt(b)
	if !aOk || !bOk {
		return !aOk && !bOk
	}
	return aVal == bVal
}

// IsEqualFloat compares two number-ish operands.
func IsEqualFloat(a, b any) bool {
	aVal, aOk := scalarFloat(a)
	bVal, bOk := scalarFloat(b)
	if !aOk || !bOk {
		return !aOk && !bOk
	}
	return aVal == bVal
}

// IsEqualBool compares two boolean-ish operands.
func IsEqualBool(a, b any) bool {
	aVal, aOk := scalarBool(a)
	bVal, bOk := scalarBool(b)
	if !aOk || !bOk {
		return !aOk && !bOk
	}
	return aVal == bVal
}

// ConcatString joins two string-ish operands. An absent operand yields nil, the
// same way JavaScript's `undefined + "x"` never produces a usable string here.
func ConcatString(a, b any) any {
	aVal, aOk := scalarString(a)
	if !aOk {
		return nil
	}
	bVal, bOk := scalarString(b)
	if !bOk {
		return nil
	}
	return aVal + bVal
}

// AddNumber adds two number-ish operands. An absent operand yields nil. Two
// integers add as integers; anything else adds as float64 and comes back as an
// int64 when the result is integral, matching Add.
func AddNumber(a, b any) any {
	if aInt, aOk := a.(int); aOk {
		if bInt, bOk := b.(int); bOk {
			return aInt + bInt // Add keeps plain int + plain int an int
		}
	}
	if aInt, aOk := scalarInt(a); aOk {
		if bInt, bOk := scalarInt(b); bOk {
			return aInt + bInt
		}
	}
	aVal, aOk := scalarFloat(a)
	if !aOk {
		return nil
	}
	bVal, bOk := scalarFloat(b)
	if !bOk {
		return nil
	}
	res := aVal + bVal
	if IsInteger(res) {
		return ParseInt(res)
	}
	return res
}
