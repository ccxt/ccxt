package ccxtpro

import (
	"strings"
	"testing"
	"time"
)

// TestGrvtHandleErrorMessageRejectsPendingFuture pins the fix for the read-loop
// crash: HandleErrorMessage is called from WSClient.handleMessages, which runs in
// its own goroutine and has no recover, so raising the error frame as a panic
// killed the whole process. An error frame must reject the pending future(s).
func TestGrvtHandleErrorMessageRejectsPendingFuture(t *testing.T) {
	ex := NewGrvt(map[string]any{})
	client := ex.Client("wss://unused.invalid/ws")

	future := client.Future("grvt-error-frame-test")

	frame := map[string]any{
		"jsonrpc": "2.0",
		"error":   map[string]any{"code": 3030, "message": "interval invalid"},
		"id":      1,
		"method":  "subscribe",
	}

	if !ex.HandleErrorMessage(client, frame) {
		t.Fatal("expected the error frame to be handled")
	}

	select {
	case result := <-future:
		if result.Err == nil {
			t.Fatalf("expected the pending future to be rejected, got %+v", result)
		}
		if !strings.Contains(result.Err.Error(), "3030") {
			t.Fatalf("rejection does not carry the venue error frame: %v", result.Err)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("pending future was not rejected")
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
