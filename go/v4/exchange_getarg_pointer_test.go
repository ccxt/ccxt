package ccxt

import "testing"

// Maybe-undefined scalars cross the wrapper/core boundary as pointers
// (*string/*int64/*float64/*bool). GetArg is the single chokepoint every core
// optional argument passes through, so it must normalize them:
//
//	nil pointer     -> undefined  (behaves exactly like an absent argument)
//	present pointer -> its value  (behaves exactly like the plain value)
//
// A typed nil boxed in `any` is NOT `== nil`, so without this the absent case
// reads as present and the default is silently skipped.
func TestGetArgUnwrapsNullableScalarPointers(t *testing.T) {
	const def = "DEFAULT"

	// --- absent (nil pointer) must equal the untyped-nil / missing-arg behavior.
	var (
		nilStr   *string
		nilInt   *int64
		nilFloat *float64
		nilBool  *bool
	)
	absent := []struct {
		name string
		val  any
	}{
		{"*string", nilStr},
		{"*int64", nilInt},
		{"*float64", nilFloat},
		{"*bool", nilBool},
	}
	want := GetArg([]any{nil}, 0, def) // untyped nil -> default
	for _, c := range absent {
		if got := GetArg([]any{c.val}, 0, def); got != want {
			t.Errorf("GetArg(nil %s) = %#v, want %#v (absent must fall back to the default)", c.name, got, want)
		}
	}

	// --- present pointer must equal the plain value, including present zero
	// values, which is the whole point of the pointer model (a present 0/""/false
	// must stay distinguishable from an absent one).
	sv, svZero := "abc", ""
	iv, ivZero := int64(7), int64(0)
	fv, fvZero := 2.5, 0.0
	bv, bvZero := true, false
	present := []struct {
		name  string
		ptr   any
		plain any
	}{
		{"*string", &sv, sv},
		{"*string zero", &svZero, svZero},
		{"*int64", &iv, iv},
		{"*int64 zero", &ivZero, ivZero},
		{"*float64", &fv, fv},
		{"*float64 zero", &fvZero, fvZero},
		{"*bool", &bv, bv},
		{"*bool zero", &bvZero, bvZero},
	}
	for _, c := range present {
		got := GetArg([]any{c.ptr}, 0, def)
		if got != GetArg([]any{c.plain}, 0, def) {
			t.Errorf("GetArg(%s) = %#v, want %#v (present pointer must behave like its value)", c.name, got, c.plain)
		}
		if got == def {
			t.Errorf("GetArg(%s) fell back to the default, losing a present value", c.name)
		}
	}

	// --- a missing argument is still undefined regardless of the pointer model.
	if got := GetArg([]any{}, 0, def); got != def {
		t.Errorf("GetArg(missing) = %#v, want %#v", got, def)
	}
}
