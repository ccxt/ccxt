package ccxtpro

import (
	"testing"
	"time"

	ccxt "github.com/ccxt/ccxt/go/v4"
)

// grvtSubscriptions are keyed by the venue's raw selector, but watchers await
// the message hashes ('ticker::<symbol>'). A test that keys both on the same
// string would pass even when the reject lands on a key nobody awaits.
const (
	btcSubscription = "BTC_USDT_Perp@500"
	ethSubscription = "ETH_USDT_Perp@500"
	btcMessageHash  = "ticker::BTC/USDT:USDT"
	ethMessageHash  = "ticker::ETH/USDT:USDT"
)

func grvtErrorFrame(id int64) map[string]any {
	return map[string]any{
		"jsonrpc": "2.0",
		"error":   map[string]any{"code": 3030, "message": "interval invalid"},
		"id":      id,
		"method":  "subscribe",
	}
}

// TestGrvtHandleErrorMessageRejectsMatchingSubscription pins the crash fix and
// the routing: the frame's request id identifies the subscription, and the
// reject must reach the message hash the watcher is awaiting - not the raw
// subscription key. The dead subscription is dropped so a retry re-sends it.
func TestGrvtHandleErrorMessageRejectsMatchingSubscription(t *testing.T) {
	ex := NewGrvt(map[string]any{})
	client := ex.Client("wss://unused.invalid/ws")
	client.SubscriptionSet(btcSubscription, map[string]any{
		"id":            int64(7),
		"messageHashes": []any{btcMessageHash},
	})
	future := client.Future(btcMessageHash)

	if !ex.HandleErrorMessage(client, grvtErrorFrame(7)) {
		t.Fatal("expected the error frame to be handled")
	}
	select {
	case result := <-future:
		if result.Err == nil {
			t.Fatalf("expected the watching future to be rejected, got %+v", result)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("watching future was not rejected")
	}
	if client.SubscriptionHas(btcSubscription) {
		t.Fatal("failed subscription should be dropped so a retry re-sends it")
	}
	if rejections := client.GetRejections(); len(rejections) != 0 {
		t.Fatalf("error was stored under a key nobody awaits: %v", rejections)
	}
}

// TestGrvtHandleErrorMessageDoesNotRejectUnrelatedFutures pins the scoping: a
// frame whose request id belongs to another subscription must not tear down the
// other pending futures on the same connection.
func TestGrvtHandleErrorMessageDoesNotRejectUnrelatedFutures(t *testing.T) {
	ex := NewGrvt(map[string]any{})
	client := ex.Client("wss://unused.invalid/ws")
	client.SubscriptionSet(btcSubscription, map[string]any{
		"id":            int64(7),
		"messageHashes": []any{btcMessageHash},
	})
	client.SubscriptionSet(ethSubscription, map[string]any{
		"id":            int64(9),
		"messageHashes": []any{ethMessageHash},
	})
	btcFuture := client.Future(btcMessageHash)
	ethFuture := client.Future(ethMessageHash)

	if !ex.HandleErrorMessage(client, grvtErrorFrame(7)) {
		t.Fatal("expected the error frame to be handled")
	}
	select {
	case result := <-btcFuture:
		if result.Err == nil {
			t.Fatalf("expected the matching subscription to be rejected, got %+v", result)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("matching subscription was not rejected")
	}
	select {
	case result := <-ethFuture:
		t.Fatalf("unrelated subscription must stay pending, got %+v", result)
	case <-time.After(100 * time.Millisecond):
	}
	if !client.SubscriptionHas(ethSubscription) {
		t.Fatal("unrelated subscription must not be dropped")
	}
}

// TestGrvtHandleErrorMessageRejectsMultiSymbolSubscriptionOnce covers the
// shared-id shape: one subscribe request carries every symbol's raw selector,
// so several subscription keys echo the same request id and each records the
// same message hashes. The watchers must all be rejected and every dead
// subscription dropped, without duplicate rejections.
func TestGrvtHandleErrorMessageRejectsMultiSymbolSubscriptionOnce(t *testing.T) {
	ex := NewGrvt(map[string]any{})
	client := ex.Client("wss://unused.invalid/ws")
	subscription := map[string]any{
		"id":            int64(7),
		"messageHashes": []any{btcMessageHash, ethMessageHash},
	}
	client.SubscriptionSet(btcSubscription, subscription)
	client.SubscriptionSet(ethSubscription, subscription)
	btcFuture := client.Future(btcMessageHash)
	ethFuture := client.Future(ethMessageHash)

	if !ex.HandleErrorMessage(client, grvtErrorFrame(7)) {
		t.Fatal("expected the error frame to be handled")
	}
	for name, future := range map[string]<-chan ccxt.AsyncResult[any]{"btc": btcFuture, "eth": ethFuture} {
		select {
		case result := <-future:
			if result.Err == nil {
				t.Fatalf("%s future should be rejected, got %+v", name, result)
			}
		case <-time.After(2 * time.Second):
			t.Fatalf("%s future was not rejected", name)
		}
	}
	if client.SubscriptionHas(btcSubscription) || client.SubscriptionHas(ethSubscription) {
		t.Fatal("every subscription sharing the failed request id should be dropped")
	}
	if rejections := client.GetRejections(); len(rejections) != 0 {
		t.Fatalf("error was stored under a key nobody awaits: %v", rejections)
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
