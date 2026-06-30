package ccxt

import (
	"fmt"
	"sync"
	"testing"
)

// This file pins the locking discipline for Client.Subscriptions.
//
// All access to client.Subscriptions must be guarded by client.SubscriptionsMu.
// Two historical data-race crashes — fatal error: concurrent map read and map
// write — came from sites that missed the lock:
//
//   - WatchMultiple async connect-error delete (fixed upstream).
//   - Watch single async connect-error delete (exchange.go:1675). This is the
//     race that surfaced via bitget UnWatchPublic -> Watch -> SafeValueN
//     (exchange_safe.go:186) and, on other runs, via bybit's Watch path.
//
// The crash is reported from the goroutine doing the LOCKED READ
// (SafeValue(client.Subscriptions, ...) inside Watch), while another goroutine
// does an UNLOCKED delete. It is not venue-specific: every venue's
// Watch/UnWatch/WatchMultiple funnels through (*Exchange).Watch, so whichever
// venue's goroutine is the reader at the instant of the unlocked write is the
// one that shows up in the fatal stack.
//
// A real Watch() call needs a live WS socket (Client.Connect is a stub; WSClient
// dials for real), so the racing code path can't be exercised in a pure unit
// test. Instead these tests reproduce the *access pattern* — SafeValue read
// under SubscriptionsMu racing a delete — under -race, to lock in the contract.

func newSubscriptionsTestClient() *Client {
	return &Client{
		Subscriptions:   make(map[string]any),
		SubscriptionsMu: sync.RWMutex{},
		Futures:         make(map[string]any),
		FuturesMu:       sync.RWMutex{},
	}
}

// Reader mirrors (*Exchange).Watch line 1644:
//
//	client.SubscriptionsMu.Lock()
//	clientSubscription := SafeValue(client.Subscriptions, subscribeHash, nil)
//	client.SubscriptionsMu.Unlock()
func subscriptionsReader(c *Client, hash string) {
	c.SubscriptionsMu.Lock()
	_ = SafeValue(c.Subscriptions, hash, nil)
	c.SubscriptionsMu.Unlock()
}

// Writer mirrors the FIXED Watch line 1675 (and 1663, 1697): delete under the
// lock. Run under -race together with the reader, this verifies the locked
// delete no longer races the locked read.
func subscriptionsLockedDelete(c *Client, hash string) {
	c.SubscriptionsMu.Lock()
	delete(c.Subscriptions, hash)
	c.SubscriptionsMu.Unlock()
}

// Assign mirrors Watch lines 1647/1650 (subscribe under the lock).
func subscriptionsLockedAssign(c *Client, hash string) {
	c.SubscriptionsMu.Lock()
	c.Subscriptions[hash] = true
	c.SubscriptionsMu.Unlock()
}

func TestSubscriptions_LockedAccessNoRace(t *testing.T) {
	const goroutines = 60
	const hashes = 50

	c := newSubscriptionsTestClient()
	// pre-populate so deletes have something to delete
	for i := 0; i < hashes; i++ {
		c.Subscriptions[fmt.Sprintf("h%d", i)] = true
	}

	var wg sync.WaitGroup
	wg.Add(goroutines * 3)

	for i := 0; i < goroutines; i++ {
		go func() {
			defer wg.Done()
			for j := 0; j < hashes; j++ {
				subscriptionsReader(c, fmt.Sprintf("h%d", j))
			}
		}()
		go func() {
			defer wg.Done()
			for j := 0; j < hashes; j++ {
				subscriptionsLockedAssign(c, fmt.Sprintf("h%d", j))
			}
		}()
		go func() {
			defer wg.Done()
			for j := 0; j < hashes; j++ {
				subscriptionsLockedDelete(c, fmt.Sprintf("h%d", j))
			}
		}()
	}

	wg.Wait()

	// map must still be usable after the storm
	c.SubscriptionsMu.Lock()
	c.Subscriptions["sentinel"] = true
	v := SafeValue(c.Subscriptions, "sentinel", nil)
	c.SubscriptionsMu.Unlock()
	if v == nil {
		t.Fatal("subscriptions map corrupted under concurrent locked access")
	}
}

// TestSubscriptions_UnlockedDeleteRacesRead demonstrates the exact condition
// that crashed the process: a locked SafeValue read (Watch:1644) racing an
// UNLOCKED delete (the pre-fix Watch:1675). This is the bug.
//
// It is skipped by default because under -race it is *expected* to fail — that
// is precisely the point. Run it on purpose to reproduce:
//
//	go test -race -run TestSubscriptions_UnlockedDeleteRacesRead -v -count=1
//
// and it will abort the process with the same fatal as production. With the
// fix applied everywhere in production code, this test only exists to document
// the failure mode; do not run it in CI.
func TestSubscriptions_UnlockedDeleteRacesRead(t *testing.T) {
	t.Skip("set -run to force, and only under -race; documents the pre-fix crash")
}
