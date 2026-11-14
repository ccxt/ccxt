package ccxt

import (
	"fmt"
	"math/rand"
	"strings"
	"testing"
)

// fetchOHLCV divides a bar-timestamp difference by the duration; every operand
// kind the generated test can pass must report a round quotient
func TestIsRoundNumberOfTimestampQuotient(t *testing.T) {
	ex := &BaseExchange{}
	diffs := []any{int64(60000), float64(60000), int64(120000), Subtract(int64(1794676500000), int64(1794676440000)), Subtract(float64(1794676500000), int64(1794676440000))}
	for _, diff := range diffs {
		if !ex.IsRoundNumber(Divide(diff, int64(60000))) {
			t.Errorf("IsRoundNumber(Divide(%T %v, int64 60000)) = false", diff, diff)
		}
	}
	if ex.IsRoundNumber(Divide(int64(90000), int64(60000))) {
		t.Errorf("IsRoundNumber(1.5) = true")
	}
}

// indodax / krakenfutures sign() return the url as a *string local
func TestFetchAcceptsPointerUrl(t *testing.T) {
	ex := &BaseExchange{}
	url := "http://127.0.0.1:1/x"
	method := "GET"
	r := <-ex.FetchAsync(&url, &method, nil, nil)
	if r.Err != nil && strings.Contains(fmt.Sprint(r.Err), "must be a string") {
		t.Fatalf("FetchAsync(*string url, *string method) rejected the pointer: %v", r.Err)
	}
}

// one goroutine only: Store / Limit / Reset keep Data, Index and Length aligned,
// so the live StoreArray slice panics are not an index bug of the side itself
func TestOrderBookSideSingleOwnerFuzz(t *testing.T) {
	rng := rand.New(rand.NewSource(7))
	ob := NewWsOrderBook(map[string]any{}, 25)
	for i := 0; i < 200000; i++ {
		switch op := rng.Intn(100); {
		case op < 90:
			side := ob.Asks.(*OrderBookSide)
			if rng.Intn(2) == 0 {
				side = ob.Bids.(*OrderBookSide)
			}
			side.Store(float64(rng.Intn(3000)+1), float64(rng.Intn(3)))
		case op < 99:
			ob.Limit()
		default:
			rows := []any{}
			for j := 0; j < rng.Intn(40); j++ {
				rows = append(rows, []any{float64(rng.Intn(3000) + 1), float64(1)})
			}
			ob.Reset(map[string]any{"asks": rows, "bids": rows})
		}
	}
}
