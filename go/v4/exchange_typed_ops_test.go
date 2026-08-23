package ccxt

import "testing"

func strPtr(s string) *string { return &s }
func i64Ptr(i int64) *int64   { return &i }
func f64Ptr(f float64) *float64 {
	return &f
}
func boolPtr(b bool) *bool { return &b }

func TestIsEqualStringNilSemantics(t *testing.T) {
	cases := []struct {
		a, b any
		want bool
	}{
		{"delivery", "delivery", true},
		{"delivery", "swap", false},
		{strPtr("delivery"), "delivery", true},
		{"delivery", strPtr("delivery"), true},
		{strPtr("delivery"), strPtr("delivery"), true},
		{strPtr("delivery"), strPtr("swap"), false},
		{(*string)(nil), (*string)(nil), true},
		{(*string)(nil), nil, true},
		{nil, nil, true},
		{(*string)(nil), "delivery", false},
		{"delivery", (*string)(nil), false},
		{"", (*string)(nil), false}, // a present empty string is not absent
	}
	for _, c := range cases {
		if got := IsEqualString(c.a, c.b); got != c.want {
			t.Errorf("IsEqualString(%#v, %#v) = %v, want %v", c.a, c.b, got, c.want)
		}
	}
}

func TestIsEqualIntNilSemantics(t *testing.T) {
	cases := []struct {
		a, b any
		want bool
	}{
		{1, 1, true},
		{1, 2, false},
		{int64(1), 1, true},
		{i64Ptr(1), 1, true},
		{i64Ptr(1), i64Ptr(1), true},
		{i64Ptr(1), i64Ptr(2), false},
		{(*int64)(nil), (*int64)(nil), true},
		{(*int64)(nil), nil, true},
		{(*int64)(nil), 0, false}, // absent is not a present zero
		{0, (*int64)(nil), false},
	}
	for _, c := range cases {
		if got := IsEqualInt(c.a, c.b); got != c.want {
			t.Errorf("IsEqualInt(%#v, %#v) = %v, want %v", c.a, c.b, got, c.want)
		}
	}
}

func TestIsEqualFloatAndBoolNilSemantics(t *testing.T) {
	if !IsEqualFloat(1.5, f64Ptr(1.5)) {
		t.Error("IsEqualFloat(1.5, *1.5) should be true")
	}
	if IsEqualFloat((*float64)(nil), 0.0) {
		t.Error("absent float must not equal a present 0")
	}
	if !IsEqualFloat((*float64)(nil), (*float64)(nil)) {
		t.Error("absent float must equal absent float")
	}
	if !IsEqualFloat(1, 1.0) {
		t.Error("an int literal must compare equal to the same float")
	}
	if !IsEqualBool(true, boolPtr(true)) {
		t.Error("IsEqualBool(true, *true) should be true")
	}
	if IsEqualBool((*bool)(nil), false) {
		t.Error("absent bool must not equal a present false")
	}
	if !IsEqualBool((*bool)(nil), (*bool)(nil)) {
		t.Error("absent bool must equal absent bool")
	}
}

func TestConcatStringNilInNilOut(t *testing.T) {
	if got := ConcatString("BTC", "/USDT"); got != "BTC/USDT" {
		t.Errorf("ConcatString = %#v, want BTC/USDT", got)
	}
	if got := ConcatString(strPtr("BTC"), "/USDT"); got != "BTC/USDT" {
		t.Errorf("ConcatString(*BTC, /USDT) = %#v", got)
	}
	if got := ConcatString((*string)(nil), "/USDT"); got != nil {
		t.Errorf("nil in must be nil out, got %#v", got)
	}
	if got := ConcatString("BTC", (*string)(nil)); got != nil {
		t.Errorf("nil in must be nil out, got %#v", got)
	}
	if got := ConcatString(nil, nil); got != nil {
		t.Errorf("nil in must be nil out, got %#v", got)
	}
}

func TestAddNumberNilInNilOut(t *testing.T) {
	if got := AddNumber(1, 2); got != 3 {
		t.Errorf("AddNumber(1, 2) = %#v, want 3", got)
	}
	if got := AddNumber(i64Ptr(1), 2); got != int64(3) {
		t.Errorf("AddNumber(*1, 2) = %#v, want int64(3)", got)
	}
	if got := AddNumber(1.5, 2.5); got != int64(4) {
		t.Errorf("AddNumber(1.5, 2.5) = %#v, want int64(4) (integral result)", got)
	}
	if got := AddNumber(1.5, 1.0); got != 2.5 {
		t.Errorf("AddNumber(1.5, 1.0) = %#v, want 2.5", got)
	}
	if got := AddNumber((*int64)(nil), 2); got != nil {
		t.Errorf("nil in must be nil out, got %#v", got)
	}
	if got := AddNumber(1, (*float64)(nil)); got != nil {
		t.Errorf("nil in must be nil out, got %#v", got)
	}
}

// the typed helpers must agree with the untyped ones on every *value* operand the
// printer can route to them, so the emit change alters no behaviour. Pointer
// operands are deliberately excluded: today's IsEqual/Add box them into `any` and
// compare the box, which is the bug these helpers exist to avoid.
func TestTypedHelpersAgreeWithUntyped(t *testing.T) {
	strs := []any{"a", "b", "", nil}
	for _, a := range strs {
		for _, b := range strs {
			if IsEqualString(a, b) != IsEqual(a, b) {
				t.Errorf("IsEqualString(%#v, %#v)=%v but IsEqual=%v", a, b, IsEqualString(a, b), IsEqual(a, b))
			}
			if ConcatString(a, b) != Add(a, b) {
				t.Errorf("ConcatString(%#v, %#v)=%#v but Add=%#v", a, b, ConcatString(a, b), Add(a, b))
			}
		}
	}
	nums := []any{0, 1, 2, int64(1), int64(2), nil}
	for _, a := range nums {
		for _, b := range nums {
			if IsEqualInt(a, b) != IsEqual(a, b) {
				t.Errorf("IsEqualInt(%#v, %#v)=%v but IsEqual=%v", a, b, IsEqualInt(a, b), IsEqual(a, b))
			}
			if AddNumber(a, b) != Add(a, b) {
				t.Errorf("AddNumber(%#v, %#v)=%#v but Add=%#v", a, b, AddNumber(a, b), Add(a, b))
			}
		}
	}
}

// a nil pointer boxed into `any` is not untyped nil, so IsEqual sees two distinct
// boxes; the typed helpers read through the pointer instead
func TestTypedHelpersFixBoxedNilComparison(t *testing.T) {
	if IsEqual((*string)(nil), nil) {
		t.Skip("IsEqual already derefs pointers on this tree")
	}
	if !IsEqualString((*string)(nil), nil) {
		t.Error("IsEqualString must treat a nil *string as absent")
	}
	if !IsEqualInt((*int64)(nil), nil) {
		t.Error("IsEqualInt must treat a nil *int64 as absent")
	}
}
