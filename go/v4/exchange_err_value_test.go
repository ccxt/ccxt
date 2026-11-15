package ccxt

import (
	"errors"
	"strings"
	"testing"
	"time"
)

// outcomeOf folds one async result back into the single value tests compare: the error, else the value.
func outcomeOf(r AsyncResult[any]) any {
	if r.Err != nil {
		return r.Err
	}
	return r.Value
}

func receiveWithin(t *testing.T, ch <-chan AsyncResult[any]) (AsyncResult[any], bool) {
	t.Helper()
	select {
	case r, ok := <-ch:
		return r, ok
	case <-time.After(2 * time.Second):
		t.Fatal("timed out waiting for an async result")
	}
	return AsyncResult[any]{}, false
}

func TestIsInstanceErrorHierarchy(t *testing.T) {
	cases := []struct {
		name  string
		value error
		typ   any
		want  bool
	}{
		{"BadRequest is ExchangeError", BadRequest("x"), ExchangeError, true},
		{"BadRequest is BadRequest", BadRequest("x"), BadRequest, true},
		{"BadSymbol is BadRequest", BadSymbol("x"), BadRequest, true},
		{"ExchangeError is not BadRequest", ExchangeError("x"), BadRequest, false},
		{"MarginModeAlreadySet is NoChange", MarginModeAlreadySet("x"), NoChange, true},
		{"MarginModeAlreadySet is OperationRejected", MarginModeAlreadySet("x"), OperationRejected, true},
		{"MarginModeAlreadySet is ExchangeError", MarginModeAlreadySet("x"), ExchangeError, true},
		{"MarginModeAlreadySet is not InvalidOrder", MarginModeAlreadySet("x"), InvalidOrder, false},
		{"NetworkError is not ExchangeError", NetworkError("x"), ExchangeError, false},
		{"RequestTimeout is NetworkError", RequestTimeout("x"), NetworkError, true},
		{"RequestTimeout is OperationFailed", RequestTimeout("x"), OperationFailed, true},
		{"not a constructor", BadRequest("x"), "BadRequest", false},
		{"unknown type is not ExchangeError", NewError("Exception", "x"), ExchangeError, false},
	}
	for _, c := range cases {
		if got := IsInstance(c.value, c.typ); got != c.want {
			t.Errorf("%s: IsInstance = %v, want %v", c.name, got, c.want)
		}
	}
	// Go has no BaseError constructor; the name still matches every ccxt error type
	for _, typ := range []ErrorType{"MarginModeAlreadySet", "NoChange", "Exception"} {
		if !errorTypeIs(typ, "BaseError") {
			t.Errorf("%s must be a BaseError", typ)
		}
	}
}

func TestErrorParentsTopLevel(t *testing.T) {
	for _, name := range []ErrorType{"ExchangeError", "OperationFailed", "UnsubscribeError"} {
		if parent := ErrorParents[name]; parent != "BaseError" {
			t.Errorf("ErrorParents[%s] = %q, want BaseError", name, parent)
		}
	}
	if parent := ErrorParents["MarginModeAlreadySet"]; parent != "NoChange" {
		t.Errorf("ErrorParents[MarginModeAlreadySet] = %q, want NoChange", parent)
	}
	if _, ok := ErrorParents["BaseError"]; ok {
		t.Error("BaseError is the root and has no parent")
	}
}

func runCore(body func()) <-chan AsyncResult[any] {
	ch := make(chan AsyncResult[any], 1)
	go func() {
		defer close(ch)
		defer ReturnPanicError(ch)
		body()
		ch <- AsyncResult[any]{Value: "done"}
	}()
	return ch
}

func TestReturnPanicErrorSendsOriginalError(t *testing.T) {
	original := InvalidOrder("bad order")
	r, ok := receiveWithin(t, runCore(func() { panic(original) }))
	if !ok || r.Err != original {
		t.Fatalf("expected the original error value, got %#v (ok=%v)", r.Err, ok)
	}
	if !IsInstance(r.Err, InvalidOrder) || IsInstance(r.Err, NetworkError) {
		t.Fatalf("error lost its ccxt type: %v", r.Err)
	}
}

func TestReturnPanicErrorWrapsNonError(t *testing.T) {
	r, ok := receiveWithin(t, runCore(func() { panic("boom message") }))
	if !ok || r.Err == nil {
		t.Fatalf("expected an error, got %#v", r)
	}
	if !strings.Contains(r.Err.Error(), "boom message") {
		t.Fatalf("message lost: %v", r.Err)
	}
}

func TestReturnPanicErrorBreakSendsNothing(t *testing.T) {
	r, ok := receiveWithin(t, runCore(func() { panic("break") }))
	if ok {
		t.Fatalf("break must send nothing, got %#v", r)
	}
}

func TestReturnPanicErrorT(t *testing.T) {
	original := BadSymbol("nope")
	ch := make(chan EndpointResult[map[string]any], 1)
	go func() {
		defer close(ch)
		defer ReturnPanicErrorT(ch)
		panic(original)
	}()
	r := <-ch
	if r.Err != original || r.Failure() != original {
		t.Fatalf("expected the original error, got %#v", r.Err)
	}
}

func resolvedTask(v any) <-chan AsyncResult[any] {
	ch := make(chan AsyncResult[any], 1)
	ch <- AsyncResult[any]{Value: v}
	close(ch)
	return ch
}

func failedTask(err error, delay time.Duration) <-chan AsyncResult[any] {
	ch := make(chan AsyncResult[any], 1)
	go func() {
		time.Sleep(delay)
		ch <- AsyncResult[any]{Err: err}
		close(ch)
	}()
	return ch
}

func TestPromiseAllValues(t *testing.T) {
	typed := make(chan EndpointResult[map[string]any], 1)
	typed <- EndpointResult[map[string]any]{Raw: "raw"}
	close(typed)
	fut := NewFuture()
	fut.Resolve("future")
	r, _ := receiveWithin(t, PromiseAll([]any{resolvedTask(1), (<-chan EndpointResult[map[string]any])(typed), fut}))
	values, ok := r.Value.([]any)
	if r.Err != nil || !ok || len(values) != 3 || values[0] != 1 || values[1] != "raw" || values[2] != "future" {
		t.Fatalf("unexpected result %#v", r)
	}
}

func TestPromiseAllFirstFailureByIndex(t *testing.T) {
	first := NetworkError("first")
	second := ExchangeError("second")
	// the index-1 task fails later than the index-2 one; index order still wins
	r, _ := receiveWithin(t, PromiseAll([]any{resolvedTask(1), failedTask(first, 50*time.Millisecond), failedTask(second, 0)}))
	if r.Err != first {
		t.Fatalf("expected the first failure by index, got %#v", r.Err)
	}
}

func TestFutureRejectDeliversErr(t *testing.T) {
	original := AuthenticationError("denied")
	f := NewFuture()
	f.Reject(original)
	r := <-f.Await()
	if r.Err != original || r.Value != nil {
		t.Fatalf("expected {Err: original}, got %#v", r)
	}
	g := NewFuture()
	g.Reject("text reason")
	if r := <-g.Await(); r.Err == nil || !strings.Contains(r.Err.Error(), "text reason") {
		t.Fatalf("non-error reason must become an error keeping its text, got %#v", r)
	}
}

func expectPanic(t *testing.T, want error, fn func()) {
	t.Helper()
	defer func() {
		r := recover()
		if r == nil {
			t.Fatalf("expected a panic with %v", want)
		}
		if err, ok := r.(error); !ok || err != want {
			t.Fatalf("expected panic value %#v, got %#v", want, r)
		}
	}()
	fn()
}

func TestPanicOnErrorOutcomes(t *testing.T) {
	original := OrderNotFound("gone")
	expectPanic(t, original, func() { PanicOnError(AsyncResult[any]{Err: original}) })
	expectPanic(t, original, func() { PanicOnError(EndpointResult[[]any]{Err: original}) })
	expectPanic(t, original, func() { PanicOnError(original) })
	expectPanic(t, original, func() { PanicOnError([]any{1, []any{"ok", original}, errors.New("later")}) })
	if v := PanicOnError(AsyncResult[any]{Value: "v"}); v != "v" {
		t.Fatalf("AsyncResult value not returned: %v", v)
	}
	if v := PanicOnError(EndpointResult[[]any]{Raw: "raw"}); v != "raw" {
		t.Fatalf("EndpointResult raw not returned: %v", v)
	}
	if v := PanicOnError("plain"); v != "plain" {
		t.Fatalf("plain value not returned: %v", v)
	}
}

func TestEndpointResultChecked(t *testing.T) {
	original := BadRequest("no")
	expectPanic(t, original, func() { EndpointResult[string]{Err: original}.Checked() })
	if v := (EndpointResult[string]{Value: "ok"}).Checked(); v != "ok" {
		t.Fatalf("Checked value = %q", v)
	}
}
