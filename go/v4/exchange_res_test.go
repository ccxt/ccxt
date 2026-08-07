package ccxt

import (
	"fmt"
	"reflect"
	"strings"
	"sync"
	"testing"
)

func headOf(s string) string {
	if i := strings.Index(s, "\nStack trace:\n"); i >= 0 {
		return s[:i]
	}
	return s
}

// (a) panic path yields Res{Err} and NOT a value.
func TestResReturnPanicErrorRes(t *testing.T) {
	produce := func() <-chan Res[string] {
		ch := make(chan Res[string])
		go func() {
			defer close(ch)
			defer ReturnPanicErrorRes(ch)
			panic("boom")
		}()
		return ch
	}

	var got []Res[string]
	for r := range produce() {
		got = append(got, r)
	}
	if len(got) != 1 {
		t.Fatalf("want exactly 1 Res, got %d: %#v", len(got), got)
	}
	r := got[0]
	if r.Err == nil {
		t.Fatalf("want Err set, got nil (Val=%q)", r.Val)
	}
	if r.Val != "" {
		t.Fatalf("want zero Val on panic path, got %q", r.Val)
	}
	if !IsErrorRes(r) {
		t.Fatalf("IsErrorRes false on error Res")
	}
	wire := PanicString(r.Err)
	if !strings.HasPrefix(wire, "panic:boom\nStack trace:\n") {
		t.Fatalf("wire format diverges from ReturnPanicError:\n%q", wire)
	}
	t.Logf("wire head = %q", headOf(wire))
	t.Logf("CreateReturnErrorRes = %v", CreateReturnErrorRes(r))

	// success path still delivers a value, no error.
	ok := make(chan Res[string], 1)
	func() {
		defer ReturnPanicErrorRes(ok)
		ok <- Res[string]{Val: "fine"}
	}()
	close(ok)
	var n int
	for r := range ok {
		n++
		if r.Err != nil || r.Val != "fine" {
			t.Fatalf("success path corrupted: %#v", r)
		}
	}
	if n != 1 {
		t.Fatalf("success path sent %d values, want 1", n)
	}
}

// (b) PanicOnErrorRes re-panics identically to PanicOnError.
func TestResPanicOnErrorParity(t *testing.T) {
	const wire = "panic:ccxtError::[\"BadRequest\"]::[\"nope\"]"

	legacy := func() (msg string, panicked bool) {
		defer func() {
			if r := recover(); r != nil {
				msg, panicked = ToString(r), true
			}
		}()
		PanicOnError(wire)
		return
	}
	typed := func() (msg string, panicked bool) {
		defer func() {
			if r := recover(); r != nil {
				msg, panicked = ToString(r), true
			}
		}()
		PanicOnErrorRes(Res[string]{Err: NewPanicError(wire)})
		return
	}

	lm, lp := legacy()
	tm, tp := typed()
	if !lp || !tp {
		t.Fatalf("both must panic; legacy=%v typed=%v", lp, tp)
	}
	t.Logf("legacy head = %q", headOf(lm))
	t.Logf("typed  head = %q", headOf(tm))
	if headOf(lm) != headOf(tm) {
		t.Fatalf("panic message head differs:\nlegacy=%q\ntyped =%q", headOf(lm), headOf(tm))
	}
	if !strings.Contains(tm, "\nStack trace:\n") {
		t.Fatalf("typed panic missing stack trace section")
	}

	// Both re-panicked strings must still satisfy the legacy detectors.
	if !IsError(lm) || !IsError(tm) {
		t.Fatalf("IsError must hold for both: legacy=%v typed=%v", IsError(lm), IsError(tm))
	}
	le, te := CreateReturnError(lm), CreateReturnError(tm)
	if fmt.Sprintf("%T", le) != fmt.Sprintf("%T", te) || le.Error() != te.Error() {
		t.Fatalf("CreateReturnError differs:\nlegacy=%T %v\ntyped =%T %v", le, le, te, te)
	}
	t.Logf("CreateReturnError parity: %T %v", te, te)

	// nil Err must not panic.
	func() {
		defer func() {
			if r := recover(); r != nil {
				t.Fatalf("PanicOnErrorRes panicked on nil Err: %v", r)
			}
		}()
		PanicOnErrorRes(Res[int64]{Val: 7})
	}()
}

// All three PanicOnError branches (string / *Error / plain error) must match.
func TestResPanicOnErrorNonStringDivergence(t *testing.T) {
	grab := func(f func()) string {
		var out string
		func() {
			defer func() {
				if r := recover(); r != nil {
					out = ToString(r)
				}
			}()
			f()
		}()
		return out
	}
	// strip the differing closure ordinal from the embedded caller name
	norm := func(s string) string {
		h := headOf(s)
		if i := strings.LastIndex(h, ".func"); i >= 0 {
			if j := strings.Index(h[i:], ":"); j >= 0 {
				return h[:i] + h[i+j:]
			}
		}
		return h
	}

	ccxtErr := CreateError("BadRequest", "nope", nil)
	legacy := grab(func() { PanicOnError(ccxtErr) })
	typed := grab(func() { PanicOnErrorRes(Res[string]{Err: ccxtErr}) })
	t.Logf("legacy *Error head = %q", norm(legacy))
	t.Logf("typed  *Error head = %q", norm(typed))
	if norm(legacy) != norm(typed) {
		t.Fatalf("*Error branch diverges:\nlegacy=%q\ntyped =%q", norm(legacy), norm(typed))
	}

	plain := fmt.Errorf("plain failure")
	lp := grab(func() { PanicOnError(plain) })
	tp := grab(func() { PanicOnErrorRes(Res[string]{Err: plain}) })
	t.Logf("legacy error head  = %q", norm(lp))
	t.Logf("typed  error head  = %q", norm(tp))
	if norm(lp) != norm(tp) {
		t.Fatalf("error branch diverges:\nlegacy=%q\ntyped =%q", norm(lp), norm(tp))
	}

	// Legacy no-ops on a non-panic string; Res has no such input (Err==nil is the no-op).
	if got := grab(func() { PanicOnError("just a value") }); got != "" {
		t.Fatalf("legacy should not panic on plain string, got %q", got)
	}
	t.Logf("IsError(legacy *Error panic)=%v (unchanged legacy behavior)", IsError(legacy))
}

// (c) the reason the layer exists: nil pointer -> untyped nil any.
func TestAnyFromPtrDefusesTypedNil(t *testing.T) {
	trap := any((*int64)(nil))
	t.Logf("NAIVE any((*int64)(nil)): IsEqual(x,nil)=%v IsTrue(x)=%v (dynamic type %T)",
		IsEqual(trap, nil), IsTrue(trap), trap)
	if IsEqual(trap, nil) || !IsTrue(trap) {
		t.Fatalf("expected the typed-nil trap to be live in the real helpers")
	}

	x := AnyFromPtr((*int64)(nil))
	t.Logf("AnyFromPtr((*int64)(nil)): IsEqual(x,nil)=%v IsTrue(x)=%v (dynamic type %T)",
		IsEqual(x, nil), IsTrue(x), x)
	if !IsEqual(x, nil) {
		t.Fatalf("IsEqual(AnyFromPtr(nil), nil) = false, want true")
	}
	if IsTrue(x) {
		t.Fatalf("IsTrue(AnyFromPtr(nil)) = true, want false")
	}
	if x != nil {
		t.Fatalf("AnyFromPtr(nil) must be an untyped nil any, got %T", x)
	}

	for _, tc := range []struct {
		name string
		got  any
		want any
	}{
		{"*string nil", AnyFromPtr((*string)(nil)), nil},
		{"*float64 nil", AnyFromPtr((*float64)(nil)), nil},
		{"*bool nil", AnyFromPtr((*bool)(nil)), nil},
		{"*int64 set", AnyFromPtr(func() *int64 { v := int64(5); return &v }()), int64(5)},
		{"*string set", AnyFromPtr(func() *string { v := "hi"; return &v }()), "hi"},
		{"*bool set false", AnyFromPtr(func() *bool { v := false; return &v }()), false},
	} {
		if tc.got != tc.want {
			t.Fatalf("%s: got %#v want %#v", tc.name, tc.got, tc.want)
		}
	}
	// *bool -> false must be falsy but NOT equal to undefined.
	f := AnyFromPtr(func() *bool { v := false; return &v }())
	if IsTrue(f) || IsEqual(f, nil) {
		t.Fatalf("present false must be falsy and not-nil: IsTrue=%v IsEqual(nil)=%v", IsTrue(f), IsEqual(f, nil))
	}

	// AnyFromVal degrades typed-nil pointers of any type.
	if v := AnyFromVal((*int64)(nil)); v != nil || !IsEqual(v, nil) {
		t.Fatalf("AnyFromVal typed nil: got %#v", v)
	}
	if v := AnyFromVal(int64(3)); v != any(int64(3)) {
		t.Fatalf("AnyFromVal value: got %#v", v)
	}
}

func TestAnyFromPtrInverse(t *testing.T) {
	if p := Int64PtrFromAny(nil); p != nil {
		t.Fatalf("Int64PtrFromAny(nil) = %v", *p)
	}
	if p := Int64PtrFromAny("wrong type"); p != nil {
		t.Fatalf("Int64PtrFromAny(string) = %v", *p)
	}
	if p := Int64PtrFromAny(int64(9)); p == nil || *p != 9 {
		t.Fatalf("Int64PtrFromAny(9) = %v", p)
	}
	if p := Float64PtrFromAny(1.5); p == nil || *p != 1.5 {
		t.Fatalf("Float64PtrFromAny(1.5) = %v", p)
	}
	if p := StringPtrFromAny("s"); p == nil || *p != "s" {
		t.Fatalf("StringPtrFromAny = %v", p)
	}
	if p := BoolPtrFromAny(false); p == nil || *p != false {
		t.Fatalf("BoolPtrFromAny(false) = %v", p)
	}
	// round trip
	v := int64(11)
	if got := Int64PtrFromAny(AnyFromPtr(&v)); got == nil || *got != 11 {
		t.Fatalf("round trip lost value: %v", got)
	}
	if got := Int64PtrFromAny(AnyFromPtr((*int64)(nil))); got != nil {
		t.Fatalf("round trip resurrected nil: %v", *got)
	}
}

// ---- probe: does CallInternalMethod's reflection path carry Res[*int64]? ----

type resProbe struct{}

func (p *resProbe) FetchThing() <-chan Res[*int64] {
	ch := make(chan Res[*int64])
	go func() {
		defer close(ch)
		v := int64(42)
		ch <- Res[*int64]{Val: &v}
	}()
	return ch
}

func (p *resProbe) FetchBoom() <-chan Res[*int64] {
	ch := make(chan Res[*int64])
	go func() {
		defer close(ch)
		defer ReturnPanicErrorRes(ch)
		panic("probe blew up")
	}()
	return ch
}

func (p *resProbe) FetchLegacy() <-chan any {
	ch := make(chan any)
	go func() {
		defer close(ch)
		defer ReturnPanicError(ch)
		panic("probe blew up")
	}()
	return ch
}

// warmProbeCache replicates BaseExchange.WarmUpCache (exchange.go:367).
func warmProbeCache(itf any) *sync.Map {
	var cache sync.Map
	baseValue := reflect.ValueOf(itf)
	baseType := baseValue.Type()
	for i := 0; i < baseType.NumMethod(); i++ {
		method := baseType.Method(i)
		name := method.Name
		cache.Store(name, map[string]any{
			"method":      method,
			"methodValue": baseValue.MethodByName(name),
			"methodType":  method.Type,
			"numIn":       method.Type.NumIn(),
			"isVariadic":  method.Type.IsVariadic(),
		})
	}
	return &cache
}

func TestResCallInternalMethodProbe(t *testing.T) {
	p := &resProbe{}
	cache := warmProbeCache(p)

	t.Log("--- success over <-chan Res[*int64] ---")
	for v := range CallInternalMethod(cache, p, "fetchThing") {
		t.Logf("received dynamic type %T", v)
		t.Logf("  IsError(v)   = %v   <-- legacy detector", IsError(v))
		t.Logf("  IsTrue(v)    = %v", IsTrue(v))
		r, ok := v.(Res[*int64])
		t.Logf("  assert Res[*int64] ok=%v", ok)
		if !ok {
			t.Fatalf("expected Res[*int64] to survive boxing, got %T", v)
		}
		t.Logf("  r.Err=%v r.Val=%v AnyFromPtr(r.Val)=%#v", r.Err, *r.Val, AnyFromPtr(r.Val))
	}

	t.Log("--- panic over <-chan Res[*int64] ---")
	for v := range CallInternalMethod(cache, p, "fetchBoom") {
		t.Logf("received dynamic type %T", v)
		t.Logf("  IsError(v)   = %v   <-- legacy detector MISSES typed errors", IsError(v))
		r, ok := v.(Res[*int64])
		if !ok {
			t.Fatalf("expected Res[*int64], got %T", v)
		}
		t.Logf("  IsErrorRes(r)= %v   <-- typed detector", IsErrorRes(r))
		t.Logf("  head = %q", headOf(PanicString(r.Err)))
		t.Logf("  AnyFromPtr(r.Val) on error = %#v", AnyFromPtr(r.Val))
	}

	t.Log("--- panic over legacy <-chan any (control) ---")
	for v := range CallInternalMethod(cache, p, "fetchLegacy") {
		t.Logf("received dynamic type %T", v)
		t.Logf("  IsError(v)   = %v", IsError(v))
		t.Logf("  head = %q", headOf(ToString(v)))
	}

	t.Log("--- ResChanToAny bridge makes the typed panic legacy-visible ---")
	for v := range ResChanToAny(p.FetchBoom()) {
		t.Logf("received dynamic type %T IsError=%v head=%q", v, IsError(v), headOf(ToString(v)))
		if !IsError(v) {
			t.Fatalf("bridge failed to restore legacy error detection")
		}
	}
	t.Log("--- ResChanToAny bridge degrades a nil *int64 to untyped nil ---")
	nilch := make(chan Res[*int64], 1)
	nilch <- Res[*int64]{}
	close(nilch)
	for v := range ResChanToAny((<-chan Res[*int64])(nilch)) {
		t.Logf("received %#v IsEqual(v,nil)=%v IsTrue(v)=%v", v, IsEqual(v, nil), IsTrue(v))
		if !IsEqual(v, nil) || IsTrue(v) {
			t.Fatalf("bridge leaked a typed nil")
		}
	}
}
