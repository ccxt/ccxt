package ccxt

import (
	"reflect"
	"testing"
)

// Generated wrappers now bind optional arguments from the typed option-struct fields, so
// GetArg receives POINTERS instead of plain values. These tests assert the two invariants
// that make that change byte-identical at runtime:
//
//	present: GetArg([]any{&v}, 0, def) == GetArg([]any{v}, 0, def)
//	absent:  GetArg([]any{(*T)(nil)}, 0, def) == def
//
// The absent case is the one that would silently break without the pointer unwrapping in
// GetArg: a typed nil boxed in `any` is NOT `== nil`.
func TestGetArgUnwrapsPointersDifferentially(t *testing.T) {
	def := any("DEFAULT")

	s := "BTC/USDT"
	i := int64(42)
	f := 3.14
	b := true
	sl := []string{"BTC/USDT", "ETH/USDT"}
	m := map[string]any{"recvWindow": int64(5000)}
	var a any = "anything"

	cases := []struct {
		name  string
		ptr   any // pointer form (what the new wrappers pass)
		plain any // value form (what the old wrappers passed)
		nilP  any // typed nil pointer (absent optional)
	}{
		{"string", &s, s, (*string)(nil)},
		{"int64", &i, i, (*int64)(nil)},
		{"float64", &f, f, (*float64)(nil)},
		{"bool", &b, b, (*bool)(nil)},
		{"[]string", &sl, sl, (*[]string)(nil)},
		{"map[string]any", &m, m, (*map[string]any)(nil)},
		{"any", &a, a, (*any)(nil)},
	}

	for _, c := range cases {
		gotPtr := GetArg([]any{c.ptr}, 0, def)
		gotPlain := GetArg([]any{c.plain}, 0, def)
		if !reflect.DeepEqual(gotPtr, gotPlain) {
			t.Errorf("%s: present mismatch: pointer form -> %#v, value form -> %#v", c.name, gotPtr, gotPlain)
		}
		gotNil := GetArg([]any{c.nilP}, 0, def)
		if !reflect.DeepEqual(gotNil, def) {
			t.Errorf("%s: typed nil pointer -> %#v, want default %#v", c.name, gotNil, def)
		}
	}
}

// A *any holding an untyped nil must behave exactly like passing that nil directly.
func TestGetArgPointerToNilAny(t *testing.T) {
	def := any(123)
	var inner any
	if got := GetArg([]any{&inner}, 0, def); !reflect.DeepEqual(got, def) {
		t.Errorf("*any(nil inner) -> %#v, want %#v", got, def)
	}
	if got := GetArg([]any{inner}, 0, def); !reflect.DeepEqual(got, def) {
		t.Errorf("untyped nil -> %#v, want %#v", got, def)
	}
}

// Existing semantics must be untouched for non-pointer arguments.
func TestGetArgNonPointerSemanticsUnchanged(t *testing.T) {
	def := any("D")
	if got := GetArg([]any{}, 0, def); got != def {
		t.Errorf("missing index -> %#v, want %#v", got, def)
	}
	if got := GetArg([]any{nil}, 0, def); got != def {
		t.Errorf("untyped nil -> %#v, want %#v", got, def)
	}
	var nilSlice []any
	if got := GetArg([]any{nilSlice}, 0, def); got != def {
		t.Errorf("nil []any -> %#v, want %#v", got, def)
	}
	if got := GetArg([]any{"x", "y"}, 1, def); got != "y" {
		t.Errorf("index 1 -> %#v, want \"y\"", got)
	}
	empty := []any{}
	got := GetArg([]any{empty}, 0, def)
	if !reflect.DeepEqual(got, empty) {
		t.Errorf("empty []any -> %#v, want %#v", got, empty)
	}
}
