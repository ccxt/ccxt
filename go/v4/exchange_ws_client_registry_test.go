package ccxt

import (
	"errors"
	"sync"
	"testing"
)

// The ws client registry is owned by the ws dispatch loop (see exchange_ws_cache.go): the loop is
// its only reader and writer, and generated user-path reads go through WsClientsSnapshot, which
// asks the loop for a copy. These tests pin the hand-off, the get-or-create identity and that the
// snapshot is a copy, not just that the tree compiles.

// newOwnedBaseExchange builds a bare base exchange the way a constructor does: startOwners
// runs before the object is used, so the hand-off paths need no lazy start.
func newOwnedBaseExchange() *BaseExchange {
	exchange := &BaseExchange{}
	exchange.startOwners()
	return exchange
}

func TestWsClientRegistryOwnsOneClientPerUrl(t *testing.T) {
	exchange := newOwnedBaseExchange()
	defer exchange.wsCacheStop()
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
	// a generated read walks the snapshot the owner hands out and finds the created client
	if published := exchange.WsClientsSnapshot()["wss://a"]; published != any(first) {
		t.Fatalf("published entry = %v, want the created client", published)
	}
}

func TestWsClientRegistryDeleteOnlyOnTheOwnersTerms(t *testing.T) {
	exchange := newOwnedBaseExchange()
	defer exchange.wsCacheStop()
	kept := NewWSClient("wss://b", nil, nil, nil, nil, "")
	other := NewWSClient("wss://b", nil, nil, nil, nil, "")
	exchange.wsClientGetOrCreate("wss://b", func() any { return kept })

	// a client that is not the registered one leaves the entry alone
	exchange.wsClientDeleteIfSame("wss://b", other)
	if _, ok := exchange.WsClientsSnapshot()["wss://b"]; !ok {
		t.Fatalf("delete-if-same must keep an entry held by another client")
	}
	exchange.wsClientDeleteIfSame("wss://b", kept)
	if _, ok := exchange.WsClientsSnapshot()["wss://b"]; ok {
		t.Fatalf("delete-if-same must remove the registered client")
	}
}

func TestWsClientRegistryDeleteIfErrored(t *testing.T) {
	exchange := newOwnedBaseExchange()
	defer exchange.wsCacheStop()
	client := NewWSClient("wss://e", nil, nil, nil, nil, "")
	exchange.wsClientGetOrCreate("wss://e", func() any { return client })

	exchange.wsClientDeleteIfErrored("wss://e")
	if _, ok := exchange.WsClientsSnapshot()["wss://e"]; !ok {
		t.Fatalf("a healthy client must stay registered")
	}
	client.SetError(errors.New("boom"))
	exchange.wsClientDeleteIfErrored("wss://e")
	if _, ok := exchange.WsClientsSnapshot()["wss://e"]; ok {
		t.Fatalf("an errored client must be dropped")
	}
}

func TestWsClientRegistryDrainHandsBackEveryClient(t *testing.T) {
	exchange := newOwnedBaseExchange()
	defer exchange.wsCacheStop()
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
	if left := len(exchange.WsClientsSnapshot()); left != 0 {
		t.Fatalf("drain must clear the registry, %d entries left", left)
	}
}

func TestWsClientRegistryConcurrentGetOrCreateBuildsOnce(t *testing.T) {
	exchange := newOwnedBaseExchange()
	defer exchange.wsCacheStop()
	var mu sync.Mutex
	builds := 0
	build := func() any {
		mu.Lock()
		builds++
		mu.Unlock()
		return NewWSClient("wss://f", nil, nil, nil, nil, "")
	}
	seen := make([]*WSClient, 8)
	var wg sync.WaitGroup
	for worker := 0; worker < len(seen); worker++ {
		w := worker
		wg.Add(1)
		go func() {
			defer wg.Done()
			client, _ := exchange.wsClientGetOrCreate("wss://f", build).(*WSClient)
			seen[w] = client
		}()
	}
	wg.Wait()
	for w, client := range seen {
		if client == nil || client != seen[0] {
			t.Fatalf("worker %d got a different client than worker 0", w)
		}
	}
	if builds != 1 {
		t.Fatalf("builds = %d, want 1", builds)
	}
}

func TestWsClientRegistrySnapshotIsACopy(t *testing.T) {
	exchange := newOwnedBaseExchange()
	defer exchange.wsCacheStop()
	client := NewWSClient("wss://g", nil, nil, nil, nil, "")
	exchange.wsClientGetOrCreate("wss://g", func() any { return client })

	snapshot := exchange.WsClientsSnapshot()
	delete(snapshot, "wss://g")
	if _, ok := exchange.WsClientsSnapshot()["wss://g"]; !ok {
		t.Fatalf("a caller editing its snapshot must not touch the registry")
	}
}
