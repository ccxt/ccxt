package ccxt

import (
	"testing"
	"time"
)

func newNeverConnectedWSClient(url string) *WSClient {
	return &WSClient{Client: NewClient(url, nil, nil, nil, nil)}
}

func awaitClosed(t *testing.T, future *Future) {
	t.Helper()
	if future == nil {
		t.Fatal("Close returned a nil future")
	}
	select {
	case res := <-future.Await():
		if res.Err != nil {
			t.Fatalf("Disconnected resolved with error: %v", res.Err)
		}
	case <-time.After(time.Second):
		t.Fatal("Close returned a Disconnected future that never resolves")
	}
}

func TestWSClientCloseWithoutConnectionResolves(t *testing.T) {
	ws := newNeverConnectedWSClient("ws://127.0.0.1:1")
	if ws.HasConnection() {
		t.Fatal("test client must not have a connection")
	}
	awaitClosed(t, ws.Close())
	awaitClosed(t, ws.Close())
}

func TestWSClientCloseWithoutConnectionInitializesNilDisconnected(t *testing.T) {
	ws := newNeverConnectedWSClient("ws://127.0.0.1:1")
	ws.Disconnected = nil
	awaitClosed(t, ws.Close())
}

func TestBaseExchangeCloseNeverConnected(t *testing.T) {
	url := "ws://127.0.0.1:1"
	ws := newNeverConnectedWSClient(url)
	ex := &BaseExchange{Clients: map[string]any{url: ws}}
	done := make(chan struct{})
	go func() {
		ex.Close()
		close(done)
	}()
	select {
	case <-done:
	case <-time.After(time.Second):
		t.Fatal("BaseExchange.Close blocked on a never-connected client")
	}
}
