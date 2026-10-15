package ccxt

import (
	"fmt"
	"math"
	"testing"
)

// ---------------------------------------------------------------------------
// Regression tests for https://github.com/ccxt/ccxt/pull/29750, the go lane
// of the indexed-orderbook audit behind https://github.com/ccxt/ccxt/pull/29749.
//
// These cover go-only failure modes the shared transpiled base test cannot
// reach: the formerly unbounded id walks (process-fatal panic on the ws read
// path, which has no recover), the nil-price deltas bitmex sends for
// orderBookL2 updates and deletes, the dead price-recovery sentinel, and
// cross-type id equality. All of these panicked or corrupted the book before
// https://github.com/ccxt/ccxt/pull/29750.
// ---------------------------------------------------------------------------

func seedIndexedAsks(t *testing.T, n int, depth any) *IndexedOrderBookSide {
	t.Helper()
	side := NewIndexedOrderBookSide(false, [][]any{}, depth)
	for i := 1; i <= n; i++ {
		side.StoreArray([]any{float64(i * 10), 1.0, fmt.Sprintf("id%d", i)})
	}
	return side
}

func mustNotPanic(t *testing.T, label string, f func()) {
	t.Helper()
	defer func() {
		if r := recover(); r != nil {
			t.Fatalf("%s panicked: %v", label, r)
		}
	}()
	f()
}

func TestIndexedLimitCleansHashmap(t *testing.T) {
	asks := seedIndexedAsks(t, 6, 3)
	asks.Limit()
	if asks.Len() != 3 || len(asks.Hashmap) != 3 {
		t.Fatalf("after limit: Len=%d hashmap=%d, want 3/3", asks.Len(), len(asks.Hashmap))
	}
	asks.Limit()
	if asks.Len() != 3 || len(asks.Hashmap) != 3 {
		t.Fatalf("limit not idempotent: Len=%d hashmap=%d", asks.Len(), len(asks.Hashmap))
	}
}

func TestIndexedTrimmedIdDeleteIsNoOp(t *testing.T) {
	asks := seedIndexedAsks(t, 6, 3)
	asks.Limit()
	mustNotPanic(t, "trimmed-id delete", func() {
		asks.StoreArray([]any{60.0, 0.0, "id6"})
	})
	if asks.Len() != 3 || len(asks.Hashmap) != 3 {
		t.Fatalf("Len=%d hashmap=%d, want 3/3", asks.Len(), len(asks.Hashmap))
	}
}

func TestIndexedTrimmedIdReinserts(t *testing.T) {
	asks := seedIndexedAsks(t, 6, 3)
	asks.Limit()
	mustNotPanic(t, "trimmed-id re-add", func() {
		asks.StoreArray([]any{60.0, 2.0, "id6"})
	})
	if asks.Len() != 4 || len(asks.Hashmap) != 4 {
		t.Fatalf("Len=%d hashmap=%d, want 4/4", asks.Len(), len(asks.Hashmap))
	}
}

func TestIndexedStaleHashmapEntryDegradesGracefully(t *testing.T) {
	// a stale entry (row gone, id still mapped) formerly sent all three id
	// walks off the slice with an index-out-of-range panic
	cases := []struct {
		name  string
		delta []any
	}{
		{"same-price update", []any{15.0, 2.0, "ghost"}},
		{"moved-price update", []any{17.0, 2.0, "ghost"}},
		{"delete", []any{15.0, 0.0, "ghost"}},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			asks := seedIndexedAsks(t, 2, nil)
			asks.Hashmap["ghost"] = 15.0
			mustNotPanic(t, c.name, func() {
				asks.StoreArray(c.delta)
			})
			if _, still := asks.Hashmap["ghost"]; c.delta[1] == 0.0 && still {
				t.Fatalf("stale delete did not heal the hashmap")
			}
		})
	}
}

func TestIndexedCrossTypeIdsUnify(t *testing.T) {
	asks := NewIndexedOrderBookSide(false, [][]any{}, nil)
	asks.StoreArray([]any{10.0, 1.0, float64(7)}) // id as json number
	asks.StoreArray([]any{10.0, 0.0, "7"})        // delete as string
	if asks.Len() != 0 || len(asks.Hashmap) != 0 {
		t.Fatalf("cross-type delete leaked: Len=%d hashmap=%d, want 0/0", asks.Len(), len(asks.Hashmap))
	}
}

func TestIndexedPriceZeroUpdateRecoversOldPrice(t *testing.T) {
	// the former sentinel check compared against 0 while missing prices were
	// mapped to MaxFloat64, so this path stored 1.79e308 as the row price
	asks := NewIndexedOrderBookSide(false, [][]any{}, nil)
	asks.StoreArray([]any{10.0, 1.0, "x"})
	asks.StoreArray([]any{0.0, 5.0, "x"})
	data := asks.GetData()
	if asks.Len() != 1 || normalizeNumber(data[0][0]) != 10.0 || normalizeNumber(data[0][1]) != 5.0 {
		t.Fatalf("row0=%v, want price 10 size 5", data[0])
	}
}

func TestIndexedNilPriceDeltas(t *testing.T) {
	// bitmex orderBookL2 updates and deletes arrive without a price, the
	// transpiled handler passes nil, and normalizeNumber formerly panicked
	t.Run("delete of known id", func(t *testing.T) {
		asks := NewIndexedOrderBookSide(false, [][]any{}, nil)
		asks.StoreArray([]any{10.0, 1.0, "8791115"})
		mustNotPanic(t, "nil-price delete", func() {
			asks.StoreArray([]any{nil, 0.0, "8791115"})
		})
		if asks.Len() != 0 || len(asks.Hashmap) != 0 {
			t.Fatalf("Len=%d hashmap=%d, want 0/0", asks.Len(), len(asks.Hashmap))
		}
	})
	t.Run("update of known id recovers price", func(t *testing.T) {
		asks := NewIndexedOrderBookSide(false, [][]any{}, nil)
		asks.StoreArray([]any{10.0, 1.0, "8791115"})
		mustNotPanic(t, "nil-price update", func() {
			asks.StoreArray([]any{nil, 5.0, "8791115"})
		})
		data := asks.GetData()
		if asks.Len() != 1 || normalizeNumber(data[0][0]) != 10.0 || normalizeNumber(data[0][1]) != 5.0 {
			t.Fatalf("row0=%v, want price 10 size 5", data[0])
		}
	})
	t.Run("unknown id drops gracefully", func(t *testing.T) {
		asks := NewIndexedOrderBookSide(false, [][]any{}, nil)
		asks.StoreArray([]any{10.0, 1.0, "a"})
		mustNotPanic(t, "nil-price unknown", func() {
			asks.StoreArray([]any{nil, 0.0, "ghost"})
			asks.StoreArray([]any{nil, 5.0, "ghost2"})
		})
		if asks.Len() != 1 {
			t.Fatalf("Len=%d, want 1", asks.Len())
		}
	})
}

func TestIndexedBidsLifecycle(t *testing.T) {
	bids := NewIndexedOrderBookSide(true, [][]any{}, 3)
	for i := 1; i <= 5; i++ {
		bids.StoreArray([]any{float64(i * 10), 1.0, fmt.Sprintf("b%d", i)})
	}
	bids.Limit()                            // keeps 50,40,30; trims b2,b1
	bids.StoreArray([]any{10.0, 2.0, "b1"}) // re-add trimmed
	bids.StoreArray([]any{45.0, 3.0, "b3"}) // move live
	bids.StoreArray([]any{50.0, 0.0, "b5"}) // delete live top
	bids.Limit()
	data := bids.GetData()
	if bids.Len() != 3 || len(bids.Hashmap) != 3 {
		t.Fatalf("Len=%d hashmap=%d, want 3/3", bids.Len(), len(bids.Hashmap))
	}
	wantIds := []string{"b3", "b4", "b1"}
	for i, w := range wantIds {
		if normalizeId(data[i][2]) != w {
			t.Fatalf("row %d id=%v, want %s (book=%v)", i, data[i][2], w, data)
		}
	}
}

// Index stays SIZE-long. Insert/delete shift inside the live prefix;
// the tail is MaxFloat64 seed, so len(Index) is invariant.

func TestIndexedIndexDoesNotGrowOnInsertDeleteCycles(t *testing.T) {
	asks := NewIndexedOrderBookSide(false, [][]any{}, nil)
	start := len(*asks.GetIndex())
	if start != SIZE {
		t.Fatalf("fresh index len=%d, want %d", start, SIZE)
	}
	for i := 0; i < 5000; i++ {
		asks.StoreArray([]any{100.0 + float64(i%16), 1.0, fmt.Sprintf("x%d", i%16)})
		asks.StoreArray([]any{100.0 + float64(i%16), 0.0, fmt.Sprintf("x%d", i%16)})
	}
	if got := len(*asks.GetIndex()); got != start {
		t.Fatalf("index grew to %d after 5000 insert/delete cycles, want %d", got, start)
	}
	if asks.Len() != 0 || len(asks.Hashmap) != 0 {
		t.Fatalf("book not empty: Len=%d hashmap=%d", asks.Len(), len(asks.Hashmap))
	}
}

// a price move of a live id takes the separate remove-then-reinsert path
func TestIndexedIndexDoesNotGrowOnPriceMoves(t *testing.T) {
	bids := NewIndexedOrderBookSide(true, [][]any{}, nil)
	for i := 0; i < 8; i++ {
		bids.StoreArray([]any{100.0 + float64(i), 1.0, fmt.Sprintf("m%d", i)})
	}
	start := len(*bids.GetIndex())
	for i := 0; i < 5000; i++ {
		id := fmt.Sprintf("m%d", i%8)
		bids.StoreArray([]any{200.0 + float64(i%8), 1.0, id})
		bids.StoreArray([]any{100.0 + float64(i%8), 1.0, id})
	}
	if got := len(*bids.GetIndex()); got != start {
		t.Fatalf("index grew to %d after 5000 price moves, want %d", got, start)
	}
	if bids.Len() != 8 {
		t.Fatalf("Len=%d, want 8", bids.Len())
	}
}

// the live prefix must stay sorted and the tail must stay sentinel-filled after
// the bounded shifts, on every side type
func TestOrderBookSideIndexTailStaysSentinel(t *testing.T) {
	asks := NewOrderBookSide(false, [][]any{}, nil)
	for i := 0; i < 40; i++ {
		asks.StoreArray([]float64{100.0 + float64((i*7)%40), 1.0})
	}
	for i := 0; i < 40; i += 3 {
		asks.StoreArray([]float64{100.0 + float64(i), 0.0})
	}
	idx := *asks.GetIndex()
	for i := 1; i < asks.Len(); i++ {
		if idx[i-1] > idx[i] {
			t.Fatalf("index not sorted at %d: %v > %v", i, idx[i-1], idx[i])
		}
	}
	for i := asks.Len(); i < len(idx); i++ {
		if idx[i] != math.MaxFloat64 {
			t.Fatalf("index slot %d past Length=%d is %v, want MaxFloat64", i, asks.Len(), idx[i])
		}
	}
}
