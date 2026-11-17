package ccxt

import (
	"errors"
	"testing"
)

// The ws client registry is the plain map this.Clients, edited in place by the wsClient* helpers.

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
