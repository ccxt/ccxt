package ccxt

import "testing"

// The Precise String* arithmetic helpers return *string: a nil result means the
// TypeScript `undefined` that Precise.stringMul & co. produce when an operand is
// absent, so a present empty string stays distinct from an absent value.

func strPtr(s string) *string { return &s }

func TestPreciseStringArithReturnsPointerToSameValue(t *testing.T) {
	cases := []struct {
		name string
		got  *string
		want string
	}{
		{"StringMul", StringMul("3", "4"), "12"},
		{"StringDiv", StringDiv("12", "4"), "3"},
		{"StringAdd", StringAdd("3", "4"), "7"},
		{"StringSub", StringSub("4", "3"), "1"},
		{"StringMax", StringMax("3", "4"), "4"},
		{"StringMin", StringMin("3", "4"), "3"},
		{"StringAbs", StringAbs("-3"), "3"},
		{"StringNeg", StringNeg("3"), "-3"},
		{"StringMod", StringMod("7", "4"), "3"},
	}
	for _, c := range cases {
		if c.got == nil {
			t.Errorf("%s: got nil, want %q", c.name, c.want)
			continue
		}
		if *c.got != c.want {
			t.Errorf("%s: got %q, want %q", c.name, *c.got, c.want)
		}
	}
}

// An absent operand yields an absent result, on either side, whether the
// absence arrives as an untyped nil or as a *string nil.
func TestPreciseStringArithNilInNilOut(t *testing.T) {
	var nilPtr *string
	absent := []any{nil, nilPtr}

	for _, a := range absent {
		binary := map[string]*string{
			"StringMul": StringMul(a, "4"),
			"StringDiv": StringDiv(a, "4"),
			"StringAdd": StringAdd(a, "4"),
			"StringSub": StringSub(a, "4"),
			"StringMax": StringMax(a, "4"),
			"StringMin": StringMin(a, "4"),
			"StringMod": StringMod(a, "4"),
			"StringOr":  StringOr(a, "4"),
		}
		for name, got := range binary {
			if got != nil {
				t.Errorf("%s(absent, \"4\") = %q, want nil", name, *got)
			}
		}
		flipped := map[string]*string{
			"StringMul": StringMul("4", a),
			"StringDiv": StringDiv("4", a),
			"StringAdd": StringAdd("4", a),
			"StringSub": StringSub("4", a),
			"StringMax": StringMax("4", a),
			"StringMin": StringMin("4", a),
			"StringMod": StringMod("4", a),
			"StringOr":  StringOr("4", a),
		}
		for name, got := range flipped {
			if got != nil {
				t.Errorf("%s(\"4\", absent) = %q, want nil", name, *got)
			}
		}
		if got := StringAbs(a); got != nil {
			t.Errorf("StringAbs(absent) = %q, want nil", *got)
		}
		if got := StringNeg(a); got != nil {
			t.Errorf("StringNeg(absent) = %q, want nil", *got)
		}
	}
}

// Division by zero is absent, not a panic and not a zero-valued pointer.
func TestPreciseStringDivByZeroIsAbsent(t *testing.T) {
	if got := StringDiv("1", "0"); got != nil {
		t.Errorf("StringDiv(\"1\", \"0\") = %q, want nil", *got)
	}
}

// A *string operand is accepted and reads as the pointed-at value, so a
// SafeString result flows straight into Precise without an explicit deref.
func TestPreciseStringArithAcceptsPointerOperands(t *testing.T) {
	got := StringMul(strPtr("3"), strPtr("4"))
	if got == nil || *got != "12" {
		t.Fatalf("StringMul(ptr, ptr) = %v, want 12", got)
	}
	// and the result feeds the next call unchanged
	chained := StringAdd(got, "1")
	if chained == nil || *chained != "13" {
		t.Fatalf("StringAdd(StringMul(...), \"1\") = %v, want 13", chained)
	}
}

// Predicates keep returning bool, and an absent operand compares false.
func TestPreciseStringPredicatesStayBool(t *testing.T) {
	var nilPtr *string
	if !StringGt("4", "3") {
		t.Error("StringGt(\"4\", \"3\") = false, want true")
	}
	if !StringLe("3", "3") {
		t.Error("StringLe(\"3\", \"3\") = false, want true")
	}
	if !StringEq("3", strPtr("3")) {
		t.Error("StringEq(\"3\", ptr(\"3\")) = false, want true")
	}
	for _, a := range []any{nil, nilPtr} {
		if StringGt(a, "3") || StringGt("3", a) {
			t.Error("StringGt with an absent operand = true, want false")
		}
		if StringLt(a, "3") || StringLt("3", a) {
			t.Error("StringLt with an absent operand = true, want false")
		}
		if StringGe(a, "3") || StringLe(a, "3") {
			t.Error("StringGe/StringLe with an absent operand = true, want false")
		}
		if StringEq(a, "3") || StringEquals(a, "3") {
			t.Error("StringEq/StringEquals with an absent operand = true, want false")
		}
	}
}

// The runtime shims that consume a Precise result must see the pointed-at
// value, so a *string result behaves as the plain string it wraps.
func TestPreciseStringResultFlowsThroughShims(t *testing.T) {
	ptr := StringMul("3", "4")
	plain := "12"

	if ToString(ptr) != ToString(plain) {
		t.Errorf("ToString(ptr) = %q, want %q", ToString(ptr), ToString(plain))
	}
	if ParseFloat(ptr) != ParseFloat(plain) {
		t.Errorf("ParseFloat(ptr) = %v, want %v", ParseFloat(ptr), ParseFloat(plain))
	}
	if !IsEqual(ptr, plain) {
		t.Error("IsEqual(ptr, \"12\") = false, want true")
	}
	if IsTrue(ptr) != IsTrue(plain) {
		t.Errorf("IsTrue(ptr) = %v, want %v", IsTrue(ptr), IsTrue(plain))
	}
	if IsGreaterThan(ptr, "1") != IsGreaterThan(plain, "1") {
		t.Error("IsGreaterThan disagrees between the pointer and the plain form")
	}

	// an absent result is falsy, matching TypeScript's undefined
	if IsTrue(StringMul(nil, "4")) {
		t.Error("IsTrue(absent Precise result) = true, want false")
	}
}
