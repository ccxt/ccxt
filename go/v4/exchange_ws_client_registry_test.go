package ccxt

import (
	"errors"
	"testing"
)

// The ws client registry is this.Clients, a mutex-guarded map on BaseExchange: the
// wsClient* helpers mutate it under the write lock and the exported WsClient*
// accessors read it under the read lock.

func newOwnedBaseExchange() *BaseExchange {
	return &BaseExchange{}
}

func TestWsClientRegistryOwnsOneClientPerUrl(t *testing.T) {
	exchange := newOwnedBaseExchange()
	builds := 0
	build := func() any {
		builds++
		return NewWSClient("wss://a", nil, nil, nil, nil, "")
	}
	first, _ := exchange.wsClientGetOrCreate("wss://a", build).(*WSClient)
	second, _ := exchange.wsClientGetOrCreate("wss://a", build).(*WSClient)
	if first == nil || second == nil {
		t.Fatalf("get-or-create answered nil")
	}
	if first != second {
		t.Fatalf("one URL must keep one client, got two")
	}
	if builds != 1 {
		t.Fatalf("builds = %d, want 1", builds)
	}
	if published := exchange.Clients["wss://a"]; published != any(first) {
		t.Fatalf("published entry = %v, want the created client", published)
	}
}

func TestWsClientRegistryDeleteIfSame(t *testing.T) {
	exchange := newOwnedBaseExchange()
	kept := NewWSClient("wss://b", nil, nil, nil, nil, "")
	other := NewWSClient("wss://b", nil, nil, nil, nil, "")
	exchange.wsClientGetOrCreate("wss://b", func() any { return kept })

	// a client that is not the registered one leaves the entry alone
	exchange.wsClientDeleteIfSame("wss://b", other)
	if _, ok := exchange.Clients["wss://b"]; !ok {
		t.Fatalf("delete-if-same must keep an entry held by another client")
	}
	exchange.wsClientDeleteIfSame("wss://b", kept)
	if _, ok := exchange.Clients["wss://b"]; ok {
		t.Fatalf("delete-if-same must remove the registered client")
	}
}

func TestWsClientRegistryDeleteIfErrored(t *testing.T) {
	exchange := newOwnedBaseExchange()
	client := NewWSClient("wss://e", nil, nil, nil, nil, "")
	exchange.wsClientGetOrCreate("wss://e", func() any { return client })

	exchange.wsClientDeleteIfErrored("wss://e")
	if _, ok := exchange.Clients["wss://e"]; !ok {
		t.Fatalf("a healthy client must stay registered")
	}
	client.SetError(errors.New("boom"))
	exchange.wsClientDeleteIfErrored("wss://e")
	if _, ok := exchange.Clients["wss://e"]; ok {
		t.Fatalf("an errored client must be dropped")
	}
}

func TestWsClientRegistryDrainHandsBackEveryClient(t *testing.T) {
	exchange := newOwnedBaseExchange()
	want := map[string]*WSClient{}
	for _, url := range []string{"wss://c", "wss://d"} {
		key := url
		client := NewWSClient(key, nil, nil, nil, nil, "")
		want[key] = client
		exchange.wsClientGetOrCreate(key, func() any { return client })
	}
	drained := exchange.wsClientDrain()
	if len(drained) != len(want) {
		t.Fatalf("drained %d clients, want %d", len(drained), len(want))
	}
	for _, client := range drained {
		if want[client.Url] != client {
			t.Fatalf("drained a client for an unexpected url %s", client.Url)
		}
	}
	if left := len(exchange.Clients); left != 0 {
		t.Fatalf("drain must clear the registry, %d entries left", left)
	}
}

func TestWsClientRegistrySnapshotIsACopy(t *testing.T) {
	exchange := newOwnedBaseExchange()
	first := NewWSClient("wss://a", nil, nil, nil, nil, "")
	second := NewWSClient("wss://b", nil, nil, nil, nil, "")
	exchange.wsClientGetOrCreate("wss://a", func() any { return first })
	exchange.wsClientGetOrCreate("wss://b", func() any { return second })

	if empty := newOwnedBaseExchange().WsClientSnapshot(); len(empty) != 0 {
		t.Fatalf("empty registry snapshot has %d clients, want 0", len(empty))
	}
	snapshot := exchange.WsClientSnapshot()
	if len(snapshot) != 2 {
		t.Fatalf("snapshot has %d clients, want 2", len(snapshot))
	}
	seen := map[any]bool{}
	for _, client := range snapshot {
		seen[client] = true
	}
	if !seen[first] || !seen[second] {
		t.Fatalf("snapshot is missing a registered client")
	}
	// the snapshot is taken under the read lock: later mutations must not change it
	exchange.WsClientDelete("wss://a")
	if len(snapshot) != 2 {
		t.Fatalf("snapshot changed after a delete, %d clients left in the copy", len(snapshot))
	}
	if exchange.WsClientHas("wss://a") {
		t.Fatalf("delete must remove the client from the registry")
	}
}

func TestWsClientRegistryLookupGetHasIs(t *testing.T) {
	exchange := newOwnedBaseExchange()
	client := NewWSClient("wss://x", nil, nil, nil, nil, "")
	other := NewWSClient("wss://x", nil, nil, nil, nil, "")
	exchange.wsClientGetOrCreate("wss://x", func() any { return client })

	if got := exchange.WsClientLookup("wss://x"); got != any(client) {
		t.Fatalf("lookup = %v, want the registered client", got)
	}
	if got := exchange.WsClientLookup("wss://missing"); got != nil {
		t.Fatalf("lookup of an unregistered url = %v, want nil", got)
	}
	// generated code can hand over a pointer-carried url (a SafeString result)
	pointerUrl := "wss://x"
	if got := exchange.WsClientLookup(&pointerUrl); got != any(client) {
		t.Fatalf("lookup of a pointer-carried url = %v, want the registered client", got)
	}
	if got, ok := exchange.WsClientGet("wss://x"); !ok || got != any(client) {
		t.Fatalf("get = %v, %v, want the registered client, true", got, ok)
	}
	if got, ok := exchange.WsClientGet("wss://missing"); ok || got != nil {
		t.Fatalf("get of an unregistered url = %v, %v, want nil, false", got, ok)
	}
	if !exchange.WsClientHas("wss://x") {
		t.Fatalf("has must report a registered client")
	}
	if exchange.WsClientHas("wss://missing") {
		t.Fatalf("has must reject an unregistered url")
	}
	if !exchange.WsClientIs("wss://x", client) {
		t.Fatalf("is must accept the registered client")
	}
	if exchange.WsClientIs("wss://x", other) {
		t.Fatalf("is must reject a different client for the same url")
	}
	if exchange.WsClientIs("wss://missing", client) {
		t.Fatalf("is must reject an unregistered url")
	}
}
