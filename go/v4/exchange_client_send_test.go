package ccxt

import (
	"testing"
	"time"
)

// Send must not block forever when the client is not connected. The nil
// Connection branch previously rejected the internal future but never sent on
// the returned channel, so callers doing `<-client.Send(msg)` (see Exchange.watch)
// would hang indefinitely after a disconnect.
func TestClientSendNotConnectedDoesNotBlock(t *testing.T) {
	client := NewClient("wss://example.invalid", nil, nil, nil, nil)
	// a freshly constructed client has a nil Connection

	ch := client.Send(map[string]any{"op": "subscribe"})

	select {
	case res := <-ch:
		if _, ok := res.(error); !ok {
			t.Fatalf("expected an error on the channel, got %T: %v", res, res)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("Send blocked: nothing was sent on the channel when not connected")
	}
}
