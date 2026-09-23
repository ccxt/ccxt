package ccxt

import (
	"encoding/json"
	"testing"
)

// A nil-declared container local typed `map[string]any` / `[]any` is boxed into `any`
// as a typed nil; every helper must read it exactly like the untyped nil it replaces.
func TestTypedNilContainerReadsAsAbsent(t *testing.T) {
	var nilMap map[string]any
	for name, v := range map[string]any{"map": nilMap, "untyped": nil} {
		if derefScalar(v) != nil {
			t.Errorf("%s: derefScalar = %#v, want nil", name, derefScalar(v))
		}
		if !IsEqual(v, nil) || !IsEqual(nil, v) {
			t.Errorf("%s: IsEqual(x, nil) = false, want true", name)
		}
		if EvalTruthy(v) {
			t.Errorf("%s: EvalTruthy = true", name)
		}
		if InOp(v, "k") {
			t.Errorf("%s: InOp = true", name)
		}
		if GetValue(v, "k") != nil || GetValue(v, 0) != nil {
			t.Errorf("%s: GetValue not nil", name)
		}
		if GetArg([]any{v}, 0, "def") != "def" {
			t.Errorf("%s: GetArg did not answer the default", name)
		}
		if IsDictionary(v) || IsArray(v) {
			t.Errorf("%s: IsDictionary/IsArray = true", name)
		}
		if SafeValue(map[string]any{"k": v}, "k", "def") != "def" {
			t.Errorf("%s: SafeValue did not answer the default", name)
		}
		AddElementToObject(v, "k", 1) // must not panic
		got, _ := json.Marshal(map[string]any{"fee": v})
		if string(got) != `{"fee":null}` {
			t.Errorf("%s: json = %s", name, got)
		}
	}
}

// negative controls: non-nil empty containers stay present and writable
func TestEmptyContainerStaysPresent(t *testing.T) {
	m := map[string]any{}
	if IsEqual(m, nil) || derefScalar(m) == nil {
		t.Errorf("empty map read as absent")
	}
	AddElementToObject(m, "k", 1)
	if m["k"] != 1 {
		t.Errorf("AddElementToObject did not write: %#v", m)
	}
	l := []any{}
	if IsEqual(l, nil) || derefScalar(l) == nil {
		t.Errorf("empty list read as absent")
	}
	var nilList []any // FilterBy's no-match answer: still a list
	if !IsArray(nilList) || derefScalar(nilList) == nil {
		t.Errorf("nil []any no longer reads as a list")
	}
}
