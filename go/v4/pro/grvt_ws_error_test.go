package ccxtpro

import (
	"testing"
	"time"
)

// TestGrvtHandleErrorMessageRejectsMatchingSubscription pins the crash fix: an
// error frame must reject the subscription that carried its request id, not
// escape the read goroutine as a panic.
func TestGrvtHandleErrorMessageRejectsMatchingSubscription(t *testing.T) {
	ex := NewGrvt(map[string]any{})
	client := ex.Client("wss://unused.invalid/ws")
	const hash = "BTC/USDT:USDT@ticker"
	client.SubscriptionSet(hash, map[string]any{"id": int64(7), "subscription": "BTC/USDT:USDT"})
	future := client.Future(hash)

	frame := map[string]any{
		"jsonrpc": "2.0",
		"error":   map[string]any{"code": 3030, "message": "interval invalid"},
		"id":      int64(7),
		"method":  "subscribe",
	}
	if !ex.HandleErrorMessage(client, frame) {
		t.Fatal("expected the error frame to be handled")
	}
	select {
	case result := <-future:
		if result.Err == nil {
			t.Fatalf("expected the matching subscription to be rejected, got %+v", result)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("matching subscription was not rejected")
	}
}

// TestGrvtHandleErrorMessageDoesNotRejectUnrelatedFutures pins the scoping: a
// frame whose request id belongs to another subscription must not tear down the
// other pending futures on the same connection.
func TestGrvtHandleErrorMessageDoesNotRejectUnrelatedFutures(t *testing.T) {
	ex := NewGrvt(map[string]any{})
	client := ex.Client("wss://unused.invalid/ws")
	const failed = "BTC/USDT:USDT@ticker"
	const unrelated = "ETH/USDT:USDT@book"
	client.SubscriptionSet(failed, map[string]any{"id": int64(7)})
	client.SubscriptionSet(unrelated, map[string]any{"id": int64(9)})
	failedFuture := client.Future(failed)
	unrelatedFuture := client.Future(unrelated)

	frame := map[string]any{
		"jsonrpc": "2.0",
		"error":   map[string]any{"code": 3030, "message": "interval invalid"},
		"id":      int64(7),
		"method":  "subscribe",
	}
	if !ex.HandleErrorMessage(client, frame) {
		t.Fatal("expected the error frame to be handled")
	}
	select {
	case result := <-failedFuture:
		if result.Err == nil {
			t.Fatalf("expected the matching subscription to be rejected, got %+v", result)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("matching subscription was not rejected")
	}
	select {
	case result := <-unrelatedFuture:
		t.Fatalf("unrelated subscription must stay pending, got %+v", result)
	case <-time.After(100 * time.Millisecond):
	}
}

// TestGrvtHandleErrorMessageIgnoresNonErrorFrames guards the handler's existing
// contract: a frame without an "error" object is not handled.
func TestGrvtHandleErrorMessageIgnoresNonErrorFrames(t *testing.T) {
	ex := NewGrvt(map[string]any{})
	if ex.HandleErrorMessage(nil, map[string]any{"jsonrpc": "2.0", "id": 1, "result": map[string]any{}}) {
		t.Fatal("a frame without an error object must not be handled")
	}
}
