package ccxt

import (
	"errors"
	"testing"
)

// A typed core channel (Res[*int64]) must preserve "undefined" end to end: the
// wrapper returns a nil pointer, and any intra-core consumer that re-boxes the
// value must produce an UNTYPED nil so the existing `=== undefined` guards fire.
// A green build proves none of this — every helper below takes `any`.

type typedTimeCore struct {
	val any
	err error
}

func (c *typedTimeCore) FetchTime() <-chan Res[*int64] {
	ch := make(chan Res[*int64])
	go func() {
		defer close(ch)
		defer ReturnPanicErrorRes(ch)
		if c.err != nil {
			panic(c.err)
		}
		ch <- Res[*int64]{Val: Int64PtrFromAny(c.val)}
	}()
	return ch
}

// mirrors the generated wrapper body for a typed core
func (c *typedTimeCore) wrapper() (*int64, error) {
	res := <-c.FetchTime()
	if IsErrorRes(res) {
		return nil, CreateReturnErrorRes(res)
	}
	return res.Val, nil
}

func TestTypedCoreChannelUndefined(t *testing.T) {
	// present value survives as a non-nil pointer
	got, err := (&typedTimeCore{val: int64(1700000000000)}).wrapper()
	if err != nil || got == nil || *got != 1700000000000 {
		t.Fatalf("present: got=%v err=%v", got, err)
	}
	// a present ZERO must stay distinct from absent
	got, err = (&typedTimeCore{val: int64(0)}).wrapper()
	if err != nil || got == nil || *got != 0 {
		t.Fatalf("present zero: got=%v err=%v", got, err)
	}
	// undefined (core sent nil) surfaces as a nil pointer, not an error
	got, err = (&typedTimeCore{val: nil}).wrapper()
	if err != nil || got != nil {
		t.Fatalf("undefined: got=%v err=%v", got, err)
	}
	// error path travels in Err, never as a value
	got, err = (&typedTimeCore{err: errors.New("boom")}).wrapper()
	if err == nil || got != nil {
		t.Fatalf("error: got=%v err=%v", got, err)
	}
}

// The trap this design exists to avoid: a typed nil boxed straight into `any` is
// NOT == nil, so the absence guard silently never fires. AnyFromPtr is what the
// generator emits at intra-core consumption sites (see LoadTimeDifference).
func TestTypedCoreConsumerUnwrap(t *testing.T) {
	absent := Res[*int64]{}

	var naive any = absent.Val // the WRONG way
	if IsTrue(IsEqual(naive, nil)) {
		t.Fatal("precondition: expected a typed nil in any to read as present")
	}

	unwrapped := AnyFromPtr(absent.Val) // what the generator emits
	if !IsTrue(IsEqual(unwrapped, nil)) {
		t.Fatal("AnyFromPtr(nil ptr) must read as undefined")
	}
	if IsTrue(unwrapped) {
		t.Fatal("AnyFromPtr(nil ptr) must be falsy")
	}

	// a present value must behave exactly as the plain value does
	v := int64(500)
	present := AnyFromPtr(&v)
	if !IsTrue(IsEqual(present, int64(500))) {
		t.Fatal("present value must compare equal to the plain value")
	}
	if ToString(present) != ToString(int64(500)) {
		t.Fatalf("ToString mismatch: %v vs %v", ToString(present), ToString(int64(500)))
	}
	if !IsTrue(IsEqual(Subtract(int64(1000), present), Subtract(int64(1000), int64(500)))) {
		t.Fatal("arithmetic on an unwrapped pointer must match the plain value")
	}
}
