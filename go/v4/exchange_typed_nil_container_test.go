package ccxt

import (
	"encoding/json"
	"testing"
)

// A nil-declared container local typed `map[string]any` / `[]any` is boxed into `any`
// as a typed nil; every helper must read it exactly like the untyped nil it replaces.
func TestTypedNilContainerReadsAsAbsent(t *testing.T) {
	var nilMap map[string]any
	var nilList []any
	for name, v := range map[string]any{"map": nilMap, "list": nilList, "untyped": nil} {
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
		if !IsNil(v) || GetArrayLength(v) != 0 || ObjectKeys(v) != nil {
			t.Errorf("%s: IsNil/GetArrayLength/ObjectKeys differ from absent", name)
		}
		ex := &BaseExchange{}
		if ex.Omit(v, "k") != nil || ex.Clone(v) != nil || ex.ArrayConcat(v, []any{1}) != nil {
			t.Errorf("%s: Omit/Clone/ArrayConcat differ from absent", name)
		}
		if rest, first := Shift(v); rest != nil || first != nil {
			t.Errorf("%s: Shift = %#v, %#v", name, rest, first)
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
	ex := &BaseExchange{}
	noMatch := ex.FilterBy([]any{map[string]any{"a": "x"}}, "a", "y")
	if noMatch == nil || !IsArray(noMatch) || len(noMatch) != 0 {
		t.Errorf("FilterBy no-match = %#v, want an empty list", noMatch)
	}
	if sorted := ex.Sort([]string{}); sorted == nil || !IsArray(sorted) {
		t.Errorf("Sort of an empty list = %#v, want an empty list", sorted)
	}
	if orders := ConvertOrderRequestListToArray(nil); orders == nil || !IsArray(orders) {
		t.Errorf("ConvertOrderRequestListToArray(nil) = %#v, want an empty list", orders)
	}
}

// outcome runs f and reports its result, or "panic" if it panicked.
func outcome(f func() any) (res any) {
	defer func() {
		if r := recover(); r != nil {
			res = "panic"
		}
	}()
	return f()
}

// container sinks: a typed nil must give the same outcome as untyped nil
func TestTypedNilContainerSinksMatchUntyped(t *testing.T) {
	ex := &BaseExchange{}
	var nilMap map[string]any
	var nilList []any
	sinks := map[string]func(v any) any{
		"SortBy":          func(v any) any { return ex.SortBy(v, "a") },
		"SortBy2":         func(v any) any { return ex.SortBy2(v, "a", "b") },
		"GroupBy":         func(v any) any { return ex.GroupBy(v, "a") },
		"Reverse":         func(v any) any { Reverse(v); return "ok" },
		"ArraySlice":      func(v any) any { return ex.ArraySlice(v, 0) },
		"Rawencode":       func(v any) any { return ex.Rawencode(v) },
		"Urlencode":       func(v any) any { return ex.Urlencode(v) },
		"UrlencodeNested": func(v any) any { return ex.UrlencodeNested(v) },
	}
	for name, f := range sinks {
		want, _ := json.Marshal(outcome(func() any { return f(nil) }))
		for kind, v := range map[string]any{"map": nilMap, "list": nilList} {
			got, _ := json.Marshal(outcome(func() any { return f(v) }))
			if string(got) != string(want) {
				t.Errorf("%s(typed-nil %s) = %s, untyped nil = %s", name, kind, got, want)
			}
		}
	}
}
