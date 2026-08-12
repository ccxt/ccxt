package ccxt

import (
	"fmt"
	"reflect"
	"runtime/debug"
	"strings"
)

// Res is the typed counterpart of the legacy `chan any` union carrier: the
// error travels in Err instead of being smuggled in as a "panic:" string.
type Res[T any] struct {
	Val T
	Err error
}

// panicError carries the legacy wire string verbatim so that "panic:" prefix
// logic and CreateReturnError keep producing identical results.
type panicError struct{ msg string }

func (e *panicError) Error() string { return e.msg }

// NewPanicError wraps an already-formatted legacy panic string.
func NewPanicError(msg string) error { return &panicError{msg: msg} }

// PanicString renders err back to the legacy wire string.
func PanicString(err error) string {
	if err == nil {
		return ""
	}
	if pe, ok := err.(*panicError); ok {
		return pe.msg
	}
	s := err.Error()
	if strings.HasPrefix(s, "panic:") {
		return s
	}
	return "panic:" + s
}

// ReturnPanicErrorRes mirrors ReturnPanicError (exchange_helpers.go:3316),
// byte for byte, onto a typed channel.
func ReturnPanicErrorRes[T any](ch chan Res[T]) {
	if r := recover(); r != nil {
		if r != "break" {
			stack := debug.Stack()
			strErr := ToString(r)
			var panicMsg string
			if !strings.HasPrefix(strErr, "panic:") {
				panicMsg = fmt.Sprintf("panic:%s\nStack trace:\n%s", strErr, stack)
			} else {
				panicMsg = fmt.Sprintf("%s\nStack trace:\n%s", strErr, stack)
			}
			ch <- Res[T]{Err: &panicError{msg: panicMsg}}
		}
	}
}

// PanicOnErrorRes mirrors PanicOnError (exchange_helpers.go:3283) branch for
// branch, dispatching on the concrete error type. getCallerName is called at
// the same frame depth so the embedded caller name is identical.
func PanicOnErrorRes[T any](r Res[T]) {
	if r.Err == nil {
		return
	}
	caller := getCallerName()
	stack := debug.Stack()[:300]
	switch v := r.Err.(type) {
	case *panicError:
		panic(fmt.Sprintf("panic:%v:%v\nStack trace:\n%s", caller, v.msg, stack))
	case *Error:
		panic(fmt.Sprintf("ccxt.Error:%v:%v\nStack trace:\n%s", caller, v, stack))
	default:
		panic(fmt.Sprintf("error:%v:%v\nStack trace:\n%s", caller, v, stack))
	}
}

// IsErrorRes is the Res analogue of IsError (exchange.go:662).
func IsErrorRes[T any](r Res[T]) bool { return r.Err != nil }

// CreateReturnErrorRes yields the same error value CreateReturnError
// (exchange.go:670) would build from the equivalent legacy string.
func CreateReturnErrorRes[T any](r Res[T]) error {
	if r.Err == nil {
		return nil
	}
	return CreateReturnError(PanicString(r.Err))
}

// AnyFromPtr boxes a maybe-nil pointer as an *untyped* nil any, which is what
// IsEqual/IsTrue and every other `== nil` check in this package expect.
func AnyFromPtr[T any](p *T) any {
	if p == nil {
		return nil
	}
	return *p
}

// PtrFromAny is the inverse: nil when v is nil or not a T.
func PtrFromAny[T any](v any) *T {
	if v == nil {
		return nil
	}
	t, ok := v.(T)
	if !ok {
		return nil
	}
	return &t
}

func Int64PtrFromAny(v any) *int64 { return PtrFromAny[int64](v) }

func Float64PtrFromAny(v any) *float64 { return PtrFromAny[float64](v) }

func StringPtrFromAny(v any) *string { return PtrFromAny[string](v) }

func BoolPtrFromAny(v any) *bool { return PtrFromAny[bool](v) }

// AnyFromVal is the generic form of AnyFromPtr: a nil pointer of any type
// degrades to untyped nil instead of a typed nil.
func AnyFromVal[T any](v T) any {
	rv := reflect.ValueOf(any(v))
	if rv.IsValid() && rv.Kind() == reflect.Ptr && rv.IsNil() {
		return nil
	}
	return any(v)
}

// ResChanToAny bridges a typed channel back onto the legacy union protocol so
// reflection dispatchers (CallInternalMethod, exchange_helpers.go:2985) and
// existing IsError/PanicOnError call sites keep working unchanged.
func ResChanToAny[T any](in <-chan Res[T]) <-chan any {
	out := make(chan any)
	go func() {
		defer close(out)
		for r := range in {
			if r.Err != nil {
				out <- PanicString(r.Err)
				continue
			}
			out <- AnyFromVal(r.Val)
		}
	}()
	return out
}
