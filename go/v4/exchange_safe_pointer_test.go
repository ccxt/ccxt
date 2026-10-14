package ccxt

import (
	"reflect"
	"testing"
)

// The BaseExchange Safe* accessor methods return typed pointers: a nil pointer means the
// key was absent, a non-nil pointer means present (so a present zero stays distinct).
// A typed nil boxed in `any` is NOT `== nil`, which is why every shim routes through
// derefScalar; the tests below pin both halves.

func newSafePtrExchange() *BaseExchange {
	return &BaseExchange{}
}

func TestSafeStringReturnsPointer(t *testing.T) {
	this := newSafePtrExchange()
	dict := map[string]any{"symbol": "BTC/USDT"}

	got := this.SafeString(dict, "symbol")
	if got == nil {
		t.Fatalf("present key returned nil pointer")
	}
	if *got != "BTC/USDT" {
		t.Errorf("present key: got %q, want %q", *got, "BTC/USDT")
	}

	absent := this.SafeString(dict, "missing")
	if absent != nil {
		t.Errorf("absent key: got %v, want nil", absent)
	}
}

func TestSafeStringTypedNilIsNotUntypedNil(t *testing.T) {
	this := newSafePtrExchange()
	absent := this.SafeString(map[string]any{}, "missing")
	if absent != nil {
		t.Fatalf("expected nil *string")
	}
	if any(absent) == nil {
		t.Errorf("any(typed nil) should be non-nil in Go; the trap must stay real")
	}
	if derefScalar(any(absent)) != nil {
		t.Errorf("derefScalar must map the typed nil back to untyped nil")
	}
}

// Pinned CURRENT behaviour: SafeValueN treats a present empty string as absent, so
// SafeString on a present "" yields a nil pointer. This PR must not change that.
func TestSafeStringPresentEmptyStringMatchesToday(t *testing.T) {
	this := newSafePtrExchange()
	got := this.SafeString(map[string]any{"k": ""}, "k")
	if got != nil {
		t.Errorf("present empty string: got %v, want nil (pre-existing quirk)", got)
	}
}

func TestSafeIntegerReturnsPointer(t *testing.T) {
	this := newSafePtrExchange()
	dict := map[string]any{"ts": int64(1700000000000), "zero": int64(0)}

	got := this.SafeInteger(dict, "ts")
	if got == nil || *got != int64(1700000000000) {
		t.Errorf("present int: got %v", got)
	}
	zero := this.SafeInteger(dict, "zero")
	if zero == nil || *zero != 0 {
		t.Errorf("present zero must be a non-nil pointer to 0, got %v", zero)
	}
	if absent := this.SafeInteger(dict, "missing"); absent != nil {
		t.Errorf("absent key: got %v, want nil", absent)
	}
}

func TestSafeFloatReturnsPointer(t *testing.T) {
	this := newSafePtrExchange()
	dict := map[string]any{"price": 1.5, "zero": 0.0}

	got := this.SafeFloat(dict, "price")
	if got == nil || *got != 1.5 {
		t.Errorf("present float: got %v", got)
	}
	zero := this.SafeFloat(dict, "zero")
	if zero == nil || *zero != 0.0 {
		t.Errorf("present zero must be a non-nil pointer to 0, got %v", zero)
	}
	if absent := this.SafeFloat(dict, "missing"); absent != nil {
		t.Errorf("absent key: got %v, want nil", absent)
	}
}

// SafeBool / SafeDict live in the GENERATED exchange_generated.go and still return `any`,
// so they are pinned here on the property that matters: present-false and present-dict
// stay distinguishable from absent.
func TestSafeBoolReturnsPointer(t *testing.T) {
	this := newSafePtrExchange()
	dict := map[string]any{"ok": false}

	got := this.SafeBool(dict, "ok")
	if derefScalar(got) != false {
		t.Errorf("present false: got %#v, want false", got)
	}
	if derefScalar(got) == nil {
		t.Errorf("present false must not read as absent")
	}
	if absent := this.SafeBool(dict, "missing"); derefScalar(absent) != nil {
		t.Errorf("absent key: got %#v, want nil", absent)
	}
}

func TestSafeDictReturnsPointer(t *testing.T) {
	this := newSafePtrExchange()
	inner := map[string]any{"a": int64(1)}
	dict := map[string]any{"info": inner}

	got := derefScalar(this.SafeDict(dict, "info"))
	if !reflect.DeepEqual(got, inner) {
		t.Errorf("present dict: got %#v, want %#v", got, inner)
	}
	if absent := this.SafeDict(dict, "missing"); derefScalar(absent) != nil {
		t.Errorf("absent key: got %#v, want nil", absent)
	}
}

// The typed-nil-in-any trap is handled by derefScalar in every caller-facing shim, so an
// absent pointer result behaves exactly like an untyped nil and a present one exactly
// like the plain value.
func TestSafePointerIsNotTruthy(t *testing.T) {
	this := newSafePtrExchange()
	empty := map[string]any{}
	absent := this.SafeString(empty, "missing")

	if IsTrue(absent) {
		t.Errorf("IsTrue(absent pointer) = true, want false")
	}
	if !IsEqual(absent, nil) {
		t.Errorf("IsEqual(absent pointer, nil) = false, want true")
	}
	if ToString(absent) != ToString(nil) {
		t.Errorf("ToString(absent)=%q != ToString(nil)=%q", ToString(absent), ToString(nil))
	}
	if Ternary(IsTrue(absent), "yes", "no") != "no" {
		t.Errorf("Ternary took the truthy branch for an absent pointer")
	}

	present := this.SafeString(map[string]any{"k": "10"}, "k")
	if present == nil {
		t.Fatalf("present key returned nil")
	}
	if IsTrue(present) != IsTrue("10") {
		t.Errorf("IsTrue(&\"10\") != IsTrue(\"10\")")
	}
	if !IsEqual(present, "10") {
		t.Errorf("IsEqual(&\"10\", \"10\") = false, want true")
	}
	if ToString(present) != "10" {
		t.Errorf("ToString(&\"10\") = %q, want \"10\"", ToString(present))
	}
	if StringLe(present, "20") != StringLe("10", "20") {
		t.Errorf("StringLe(ptr, ...) != StringLe(value, ...)")
	}
	if StringLe("5", present) != StringLe("5", "10") {
		t.Errorf("StringLe(..., ptr) != StringLe(..., value)")
	}

	presentInt := this.SafeInteger(map[string]any{"k": int64(7)}, "k")
	if ToString(presentInt) != ToString(int64(7)) {
		t.Errorf("ToString(&int64(7)) = %q, want %q", ToString(presentInt), ToString(int64(7)))
	}
}

// A non-string default is coerced with ToString so numeric defaults still surface;
// SafeString(map{}, "k", 0) returns a pointer to "0".
func TestSafeStringNumericDefaultStillSurfaces(t *testing.T) {
	this := newSafePtrExchange()
	got := this.SafeString(map[string]any{}, "k", 0)
	if got == nil {
		t.Fatalf("numeric default returned nil pointer")
	}
	if *got != "0" {
		t.Errorf("numeric default: got %q, want %q", *got, "0")
	}

	gotInt := this.SafeInteger(map[string]any{}, "k", 5)
	if gotInt == nil || *gotInt != int64(5) {
		t.Errorf("int default: got %v, want pointer to 5", gotInt)
	}
	gotFloat := this.SafeFloat(map[string]any{}, "k", 2)
	if gotFloat == nil || *gotFloat != 2.0 {
		t.Errorf("float default: got %v, want pointer to 2", gotFloat)
	}
}
