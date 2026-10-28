package ccxt

import (
	"fmt"
	"math"
	"reflect"
	"testing"
)

// Pointer transparency, pinned differentially.
//
// The generated Go wrappers bind their maybe-undefined arguments straight from typed
// option-struct fields, so what reaches the runtime shims is a POINTER (*string, *int64,
// *float64, *bool, ...) rather than a plain value. derefScalar() is now applied at the
// entry of every caller-facing shim so that:
//
//	INVARIANT 1 (absent):  f((*T)(nil)) behaves EXACTLY as f(nil)
//	INVARIANT 2 (present): f(&v)        behaves EXACTLY as f(v)
//
// Every assertion below is DIFFERENTIAL: the pointer call is compared against the plain
// call, never against a hardcoded expected value. That is deliberate -- a hardcoded
// expectation could be made green by changing arithmetic, which would smuggle a behaviour
// change into a change that is supposed to be a pure no-op for non-pointer callers.
//
// The zero/empty variants (int64(0), "", 0.0, false) are the whole point of the pointer
// pattern: "present but zero" must stay distinguishable from "absent".

// ---------------------------------------------------------------------------
// comparison / observation plumbing
// ---------------------------------------------------------------------------

// sameResult reports whether two observed results are indistinguishable.
// NaN == NaN counts as equal (IEEE semantics would otherwise make legitimately
// identical NaN results look like a mismatch).
func sameResult(a, b any) bool {
	if a == nil && b == nil {
		return true
	}
	af, aok := a.(float64)
	bf, bok := b.(float64)
	if aok && bok {
		if math.IsNaN(af) && math.IsNaN(bf) {
			return true
		}
		return af == bf
	}
	if reflect.DeepEqual(a, b) {
		return true
	}
	// Fallback: structural rendering. This also makes nested NaNs compare equal,
	// because both sides render as "NaN".
	return fmt.Sprintf("%#v", a) == fmt.Sprintf("%#v", b)
}

// observe runs one table cell and converts a panic into an observable value, so that
// "both sides panic identically" counts as passing and a panic in one cell does not
// abort the whole run.
func observe(f func() any) (res any) {
	defer func() {
		if r := recover(); r != nil {
			res = fmt.Sprintf("PANIC: %v", r)
		}
	}()
	return f()
}

type ptChecker struct {
	t     *testing.T
	cells int
}

// cell asserts one differential pair. `variant` describes the input under test.
func (c *ptChecker) cell(helper, group, variant string, ptrCall, plainCall func() any) {
	c.t.Helper()
	c.cells++
	got := observe(ptrCall)
	want := observe(plainCall)
	if !sameResult(got, want) {
		c.t.Errorf("%s [%s / %s]: pointer form -> %#v, value form -> %#v", helper, group, variant, got, want)
	}
}

// ---------------------------------------------------------------------------
// type groups
// ---------------------------------------------------------------------------

type ptGroup struct {
	name     string
	vals     []any // non-zero variant first, zero/empty variant second
	typedNil any
	ptrOf    func(any) any
	others   []any // second operands for two-operand shims
}

func ptGroups() []ptGroup {
	return []ptGroup{
		{
			name:     "int64",
			vals:     []any{int64(7), int64(0)},
			typedNil: (*int64)(nil),
			ptrOf:    func(v any) any { x := v.(int64); return &x },
			others:   []any{int64(3), "2"},
		},
		{
			name:     "string",
			vals:     []any{"abc", ""},
			typedNil: (*string)(nil),
			ptrOf:    func(v any) any { x := v.(string); return &x },
			others:   []any{"xyz", "2"},
		},
		{
			name:     "float64",
			vals:     []any{2.5, 0.0},
			typedNil: (*float64)(nil),
			ptrOf:    func(v any) any { x := v.(float64); return &x },
			others:   []any{1.5, "2"},
		},
		{
			name:     "bool",
			vals:     []any{true, false},
			typedNil: (*bool)(nil),
			ptrOf:    func(v any) any { x := v.(bool); return &x },
			others:   []any{true, "2"},
		},
	}
}

func variantName(v any) string { return fmt.Sprintf("%#v", v) }

// ---------------------------------------------------------------------------
// shim tables
// ---------------------------------------------------------------------------

type unaryShim struct {
	name string
	call func(v any) any
}

func unaryShims() []unaryShim {
	var p *PreciseStruct // methods below ignore the receiver
	return []unaryShim{
		// exchange_helpers.go
		{"EvalTruthy", func(v any) any { return EvalTruthy(v) }},
		{"Trim", func(v any) any { return Trim(v) }},
		{"MathFloor", func(v any) any { return MathFloor(v) }},
		{"MathCeil", func(v any) any { return MathCeil(v) }},
		{"MathRound", func(v any) any { return MathRound(v) }},
		{"MathAbs", func(v any) any { return MathAbs(v) }},
		{"Negate", func(v any) any { return Negate(v) }},
		{"UnaryPlus", func(v any) any { return UnaryPlus(v) }},
		{"JsonStringify", func(v any) any { return JsonStringify(v) }},
		{"JsonParse", func(v any) any { return JsonParse(v) }},
		{"IsDictionary", func(v any) any { return IsDictionary(v) }},
		{"IsFunction", func(v any) any { return IsFunction(v) }},
		{"ObjectValues", func(v any) any { return ObjectValues(v) }},
		{"ObjectKeys", func(v any) any { return ObjectKeys(v) }},
		{"IsTrue", func(v any) any { return IsTrue(v) }},
		{"IsInteger", func(v any) any { return IsInteger(v) }},
		{"GetArrayLength", func(v any) any { return GetArrayLength(v) }},
		{"ToFloat64", func(v any) any { return ToFloat64(v) }},
		{"Increment", func(v any) any { return Increment(v) }},
		{"Decrement", func(v any) any { return Decrement(v) }},
		{"IsBool", func(v any) any { return IsBool(v) }},
		{"IsString", func(v any) any { return IsString(v) }},
		{"IsInt", func(v any) any { return IsInt(v) }},
		{"IsNumber", func(v any) any { return IsNumber(v) }},
		{"IsObject", func(v any) any { return IsObject(v) }},
		{"IsArray", func(v any) any { return IsArray(v) }},
		{"IsNil", func(v any) any { return IsNil(v) }},
		{"ToLower", func(v any) any { return ToLower(v) }},
		{"ToUpper", func(v any) any { return ToUpper(v) }},
		{"ToString", func(v any) any { return ToString(v) }},
		{"GetLength", func(v any) any { return GetLength(v) }},
		{"ParseInt", func(v any) any { return ParseInt(v) }},
		{"ParseFloat", func(v any) any { return ParseFloat(v) }},
		{"OpNeg", func(v any) any { return OpNeg(v) }},
		// exchange_precise.go
		{"StringAbs", func(v any) any { return StringAbs(v) }},
		{"StringNeg", func(v any) any { return StringNeg(v) }},
		{"(*PreciseStruct).StringAbs", func(v any) any { return p.StringAbs(v) }},
		{"(*PreciseStruct).StringNeg", func(v any) any { return p.StringNeg(v) }},
		{"NewPrecise", func(v any) any { return NewPrecise(v).ToString() }},
		// GetArg unwraps the element it pulls out of the variadic slice.
		{"GetArg", func(v any) any { return GetArg([]any{v}, 0, "DEFAULT") }},
		// getValueFromList unwraps the element it returns.
		{"getValueFromList", func(v any) any { return getValueFromList([]any{v}, []any{0}, "DEFAULT") }},
	}
}

type binaryShim struct {
	name string
	call func(a, b any) any
}

func binaryShims() []binaryShim {
	var p *PreciseStruct
	return []binaryShim{
		// exchange_helpers.go
		{"Add", func(a, b any) any { return Add(a, b) }},
		{"StartsWith", func(a, b any) any { return StartsWith(a, b) }},
		{"EndsWith", func(a, b any) any { return EndsWith(a, b) }},
		{"Contains", func(a, b any) any { return Contains(a, b) }},
		{"IndexOf", func(a, b any) any { return IndexOf(a, b) }},
		{"Split", func(a, b any) any { return Split(a, b) }},
		{"Join", func(a, b any) any { return Join(a, b) }},
		{"MathPow", func(a, b any) any { return MathPow(a, b) }},
		{"ToFixed", func(a, b any) any { return ToFixed(a, b) }},
		{"TernaryTrue", func(a, b any) any { return Ternary(true, a, b) }},
		{"TernaryFalse", func(a, b any) any { return Ternary(false, b, a) }},
		{"Multiply", func(a, b any) any { return Multiply(a, b) }},
		{"Divide", func(a, b any) any { return Divide(a, b) }},
		{"Subtract", func(a, b any) any { return Subtract(a, b) }},
		{"Mod", func(a, b any) any { return Mod(a, b) }},
		{"mathMin", func(a, b any) any { return mathMin(a, b) }},
		{"mathMax", func(a, b any) any { return mathMax(a, b) }},
		{"MathMin", func(a, b any) any { return MathMin(a, b) }},
		{"MathMax", func(a, b any) any { return MathMax(a, b) }},
		{"IsGreaterThan", func(a, b any) any { return IsGreaterThan(a, b) }},
		{"IsEqual", func(a, b any) any { return IsEqual(a, b) }},
		{"PlusEqual", func(a, b any) any { return PlusEqual(a, b) }},
		{"GetValue", func(a, b any) any { return GetValue(a, b) }},
		{"InOp", func(a, b any) any { return InOp(a, b) }},
		{"GetIndexOf", func(a, b any) any { return GetIndexOf(a, b) }},
		// AddElementToObject derefs its key and value operands; the observation is the
		// mutated container.
		{"AddElementToObject", func(a, b any) any {
			d := map[string]any{}
			AddElementToObject(d, a, b)
			return d
		}},
		// exchange_precise.go -- package-level forms
		{"StringMul", func(a, b any) any { return StringMul(a, b) }},
		{"StringDiv", func(a, b any) any { return StringDiv(a, b) }},
		{"StringSub", func(a, b any) any { return StringSub(a, b) }},
		{"StringAdd", func(a, b any) any { return StringAdd(a, b) }},
		{"StringOr", func(a, b any) any { return StringOr(a, b) }},
		{"StringGt", func(a, b any) any { return StringGt(a, b) }},
		{"StringEq", func(a, b any) any { return StringEq(a, b) }},
		{"StringMax", func(a, b any) any { return StringMax(a, b) }},
		{"StringEquals", func(a, b any) any { return StringEquals(a, b) }},
		{"StringMin", func(a, b any) any { return StringMin(a, b) }},
		{"StringLt", func(a, b any) any { return StringLt(a, b) }},
		{"StringLe", func(a, b any) any { return StringLe(a, b) }},
		{"StringGe", func(a, b any) any { return StringGe(a, b) }},
		{"StringMod", func(a, b any) any { return StringMod(a, b) }},
		// exchange_precise.go -- *PreciseStruct method forms
		{"(*PreciseStruct).StringMul", func(a, b any) any { return p.StringMul(a, b) }},
		{"(*PreciseStruct).StringDiv", func(a, b any) any { return p.StringDiv(a, b) }},
		{"(*PreciseStruct).StringSub", func(a, b any) any { return p.StringSub(a, b) }},
		{"(*PreciseStruct).StringAdd", func(a, b any) any { return p.StringAdd(a, b) }},
		{"(*PreciseStruct).StringOr", func(a, b any) any { return p.StringOr(a, b) }},
		{"(*PreciseStruct).StringGt", func(a, b any) any { return p.StringGt(a, b) }},
		{"(*PreciseStruct).StringEq", func(a, b any) any { return p.StringEq(a, b) }},
		{"(*PreciseStruct).StringMax", func(a, b any) any { return p.StringMax(a, b) }},
		{"(*PreciseStruct).StringEquals", func(a, b any) any { return p.StringEquals(a, b) }},
		{"(*PreciseStruct).StringMin", func(a, b any) any { return p.StringMin(a, b) }},
		{"(*PreciseStruct).StringLt", func(a, b any) any { return p.StringLt(a, b) }},
		{"(*PreciseStruct).StringLe", func(a, b any) any { return p.StringLe(a, b) }},
		{"(*PreciseStruct).StringGe", func(a, b any) any { return p.StringGe(a, b) }},
		{"(*PreciseStruct).StringMod", func(a, b any) any { return p.StringMod(a, b) }},
	}
}

// safeShim: f(obj, key, defaultValue). Adapters normalize the N-key and 2-key forms.
type safeShim struct {
	name string
	call func(obj, key, def any) any
}

func safeShims() []safeShim {
	return []safeShim{
		{"SafeValue", func(o, k, d any) any { return SafeValue(o, k, d) }},
		{"SafeValueN", func(o, k, d any) any { return SafeValueN(o, []any{k}, d) }},
		{"SafeString", func(o, k, d any) any { return SafeString(o, k, d) }},
		{"SafeString2", func(o, k, d any) any { return SafeString2(o, k, "unused", d) }},
		{"SafeStringN", func(o, k, d any) any { return SafeStringN(o, []any{k}, d) }},
		{"SafeStringLowerN", func(o, k, d any) any { return SafeStringLowerN(o, []any{k}, d) }},
		{"SafeStringUpperN", func(o, k, d any) any { return SafeStringUpperN(o, []any{k}, d) }},
		{"SafeInteger", func(o, k, d any) any { return SafeInteger(o, k, d) }},
		{"SafeIntegerN", func(o, k, d any) any { return SafeIntegerN(o, []any{k}, d) }},
		{"SafeInteger2", func(o, k, d any) any { return SafeInteger2(o, k, "unused", d) }},
		{"SafeInt64", func(o, k, d any) any { return SafeInt64(o, k, d) }},
		{"SafeFloat", func(o, k, d any) any { return SafeFloat(o, k, d) }},
		{"SafeFloat2", func(o, k, d any) any { return SafeFloat2(o, k, "unused", d) }},
		{"SafeFloatN", func(o, k, d any) any { return SafeFloatN(o, []any{k}, d) }},
		{"SafeBool", func(o, k, d any) any { return SafeBool(o, k, d) }},
		{"SafeTimestamp", func(o, k, d any) any { return SafeTimestamp(o, k, d) }},
		{"SafeTimestampN", func(o, k, d any) any { return SafeTimestampN(o, []any{k}, d) }},
		{"SafeIntegerProduct", func(o, k, d any) any { return SafeIntegerProduct(o, k, int64(2), d) }},
	}
}

// typedShim: f(map, key) *T from exchange_types.go. Results are returned deref'd so that
// two distinct pointers holding the same value compare equal.
type typedShim struct {
	name string
	call func(m, key any) any
}

func typedShims() []typedShim {
	return []typedShim{
		{"SafeStringTyped", func(m, k any) any {
			if r := SafeStringTyped(m, k); r != nil {
				return *r
			}
			return nil
		}},
		{"SafeInt64Typed", func(m, k any) any {
			if r := SafeInt64Typed(m, k); r != nil {
				return *r
			}
			return nil
		}},
		{"SafeFloatTyped", func(m, k any) any {
			if r := SafeFloatTyped(m, k); r != nil {
				return *r
			}
			return nil
		}},
		{"SafeBoolTyped", func(m, k any) any {
			if r := SafeBoolTyped(m, k); r != nil {
				return *r
			}
			return nil
		}},
		{"SafeBoolTyp", func(m, k any) any {
			if r := SafeBoolTyp(m, k); r != nil {
				return *r
			}
			return nil
		}},
	}
}

// ---------------------------------------------------------------------------
// tests
// ---------------------------------------------------------------------------

func TestPointerTransparencyUnaryShims(t *testing.T) {
	c := &ptChecker{t: t}
	for _, s := range unaryShims() {
		for _, g := range ptGroups() {
			nilP := g.typedNil
			c.cell(s.name, g.name, "absent: typed nil vs untyped nil",
				func() any { return s.call(nilP) },
				func() any { return s.call(nil) })
			for _, v := range g.vals {
				v := v
				ptr := g.ptrOf(v)
				c.cell(s.name, g.name, "present: &"+variantName(v),
					func() any { return s.call(ptr) },
					func() any { return s.call(v) })
			}
		}
	}
	t.Logf("unary shims: %d helpers, %d differential cells", len(unaryShims()), c.cells)
}

func TestPointerTransparencyBinaryShims(t *testing.T) {
	c := &ptChecker{t: t}
	for _, s := range binaryShims() {
		for _, g := range ptGroups() {
			nilP := g.typedNil
			for _, other := range g.others {
				other := other
				// argument position 1
				c.cell(s.name, g.name, "absent@1 vs other="+variantName(other),
					func() any { return s.call(nilP, other) },
					func() any { return s.call(nil, other) })
				// argument position 2
				c.cell(s.name, g.name, "absent@2 vs other="+variantName(other),
					func() any { return s.call(other, nilP) },
					func() any { return s.call(other, nil) })
				for _, v := range g.vals {
					v := v
					ptr := g.ptrOf(v)
					c.cell(s.name, g.name, "present@1 &"+variantName(v)+" vs other="+variantName(other),
						func() any { return s.call(ptr, other) },
						func() any { return s.call(v, other) })
					c.cell(s.name, g.name, "present@2 &"+variantName(v)+" vs other="+variantName(other),
						func() any { return s.call(other, ptr) },
						func() any { return s.call(other, v) })
				}
			}
			// both operands pointer-carried at once
			for _, v := range g.vals {
				v := v
				ptr := g.ptrOf(v)
				c.cell(s.name, g.name, "present@both &"+variantName(v),
					func() any { return s.call(ptr, ptr) },
					func() any { return s.call(v, v) })
				c.cell(s.name, g.name, "absent@both",
					func() any { return s.call(nilP, nilP) },
					func() any { return s.call(nil, nil) })
			}
		}
	}
	t.Logf("binary shims: %d helpers, %d differential cells", len(binaryShims()), c.cells)
}

// Slice takes three deref'd operands; each position is exercised independently.
func TestPointerTransparencySlice(t *testing.T) {
	c := &ptChecker{t: t}
	base := []any{"abcdef", int64(1), int64(4)}
	for _, g := range ptGroups() {
		for pos := 0; pos < 3; pos++ {
			pos := pos
			mk := func(x any) []any {
				args := append([]any{}, base...)
				args[pos] = x
				return args
			}
			nilArgs := mk(g.typedNil)
			plainNil := mk(nil)
			c.cell("Slice", g.name, fmt.Sprintf("absent@%d", pos+1),
				func() any { return Slice(nilArgs[0], nilArgs[1], nilArgs[2]) },
				func() any { return Slice(plainNil[0], plainNil[1], plainNil[2]) })
			for _, v := range g.vals {
				pa := mk(g.ptrOf(v))
				va := mk(v)
				c.cell("Slice", g.name, fmt.Sprintf("present@%d &%s", pos+1, variantName(v)),
					func() any { return Slice(pa[0], pa[1], pa[2]) },
					func() any { return Slice(va[0], va[1], va[2]) })
			}
		}
	}
	t.Logf("Slice: %d differential cells", c.cells)
}

// The Safe* family derefs three independent things: the container, the key, and the
// value stored under that key.
func TestPointerTransparencySafeFamily(t *testing.T) {
	c := &ptChecker{t: t}
	const def = "DEFAULT"
	// A dict whose keys cover the stringified form of every group value, so key lookups
	// actually hit in both the pointer and the plain call.
	dictFor := func(stored any) map[string]any {
		return map[string]any{
			"7": stored, "0": stored, "abc": stored, "": stored,
			"2.5": stored, "true": stored, "false": stored, "k": stored,
		}
	}
	for _, s := range safeShims() {
		for _, g := range ptGroups() {
			nilP := g.typedNil
			d := dictFor("V")

			// (a) container position
			c.cell(s.name+"/obj", g.name, "absent container",
				func() any { return s.call(nilP, "k", def) },
				func() any { return s.call(nil, "k", def) })
			// (b) key position
			c.cell(s.name+"/key", g.name, "absent key",
				func() any { return s.call(d, nilP, def) },
				func() any { return s.call(d, nil, def) })
			// (c) stored-value position
			c.cell(s.name+"/val", g.name, "absent stored value",
				func() any { return s.call(dictFor(nilP), "k", def) },
				func() any { return s.call(dictFor(nil), "k", def) })

			for _, v := range g.vals {
				v := v
				ptr := g.ptrOf(v)
				c.cell(s.name+"/obj", g.name, "present container &"+variantName(v),
					func() any { return s.call(ptr, "k", def) },
					func() any { return s.call(v, "k", def) })
				c.cell(s.name+"/key", g.name, "present key &"+variantName(v),
					func() any { return s.call(d, ptr, def) },
					func() any { return s.call(d, v, def) })
				c.cell(s.name+"/val", g.name, "present stored value &"+variantName(v),
					func() any { return s.call(dictFor(ptr), "k", def) },
					func() any { return s.call(dictFor(v), "k", def) })
				// NOTE: the `defaultValue` operand is deliberately NOT covered here.
				// The change under test normalizes the container, the keys and the
				// stored value, but leaves defaultValue exactly as the caller passed
				// it, so a pointer default is returned as a pointer. Asserting
				// transparency there would be asserting a behaviour this change does
				// not implement; see the summary for the precise observed values.
			}
		}
	}
	t.Logf("Safe* family: %d helpers, %d differential cells", len(safeShims()), c.cells)
}

// exchange_types.go typed accessors: the comma-ok change must keep them transparent for
// pointer-carried stored values and pointer-carried keys.
func TestPointerTransparencyTypedAccessors(t *testing.T) {
	c := &ptChecker{t: t}
	dictFor := func(stored any) map[string]any {
		return map[string]any{
			"7": stored, "0": stored, "abc": stored, "": stored,
			"2.5": stored, "true": stored, "false": stored, "k": stored,
		}
	}
	for _, s := range typedShims() {
		for _, g := range ptGroups() {
			nilP := g.typedNil
			d := dictFor("V")
			c.cell(s.name+"/key", g.name, "absent key",
				func() any { return s.call(d, nilP) },
				func() any { return s.call(d, nil) })
			c.cell(s.name+"/val", g.name, "absent stored value",
				func() any { return s.call(dictFor(nilP), "k") },
				func() any { return s.call(dictFor(nil), "k") })
			c.cell(s.name+"/obj", g.name, "absent container",
				func() any { return s.call(nilP, "k") },
				func() any { return s.call(nil, "k") })
			for _, v := range g.vals {
				v := v
				ptr := g.ptrOf(v)
				c.cell(s.name+"/key", g.name, "present key &"+variantName(v),
					func() any { return s.call(d, ptr) },
					func() any { return s.call(d, v) })
				c.cell(s.name+"/val", g.name, "present stored value &"+variantName(v),
					func() any { return s.call(dictFor(ptr), "k") },
					func() any { return s.call(dictFor(v), "k") })
				c.cell(s.name+"/obj", g.name, "present container &"+variantName(v),
					func() any { return s.call(ptr, "k") },
					func() any { return s.call(v, "k") })
			}
		}
	}
	t.Logf("typed accessors: %d helpers, %d differential cells", len(typedShims()), c.cells)
}

// A *any wrapping a pointer or an untyped nil must collapse all the way down, i.e.
// derefScalar is applied recursively for *any.
func TestPointerTransparencyNestedAnyPointer(t *testing.T) {
	c := &ptChecker{t: t}
	for _, s := range unaryShims() {
		for _, g := range ptGroups() {
			var inner any // untyped nil inside *any == absent
			c.cell(s.name, g.name+"/*any",
				"absent: *any(nil inner) vs untyped nil",
				func() any { return s.call(&inner) },
				func() any { return s.call(nil) })
			for _, v := range g.vals {
				v := v
				var boxed any = g.ptrOf(v) // *any -> *T -> value
				c.cell(s.name, g.name+"/*any", "present: *any(&"+variantName(v)+")",
					func() any { return s.call(&boxed) },
					func() any { return s.call(v) })
			}
		}
	}
	t.Logf("nested *any: %d differential cells", c.cells)
}
