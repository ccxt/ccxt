package ccxt

import (
	"testing"
)

// ---------------------------------------------------------------------------
// Regression tests for typed pointers leaking into order book delta rows.
//
// Since https://github.com/ccxt/ccxt/pull/30054 the go emitter types
// Safe*/Precise locals as pointers (*float64, *string), and transpiled
// exchange code puts such locals straight into []any delta literals:
//     orderSide.StoreArray([]any{price, amount, orderId})
// Before derefDelta, the pointers were stored as-is: bisect on a
// pointer-priced row inserted a duplicate level instead of replacing, an id
// hashmap seeded with a *string key never matched the same id arriving flat
// (or as a fresh pointer), so replaces duplicated rows and zero-size deletes
// were silent no-ops. First seen as "duplicate rows" failures in the luno
// static ws fixtures; the shared base parseOrderBookBidAsk emits the same
// pointer rows, so every venue with indexed/counted books was affected.
// ---------------------------------------------------------------------------

func ptrF(v float64) *float64 { return &v }
func ptrS(v string) *string   { return &v }
func ptrI(v int64) *int64     { return &v }

func assertFlatRows(t *testing.T, label string, data [][]any) {
	t.Helper()
	for i, row := range data {
		for j, v := range row {
			switch v.(type) {
			case *float64, *string, *int64, *int, *bool:
				t.Fatalf("%s: row %d col %d holds a pointer %T, want a flat value", label, i, j, v)
			}
		}
	}
}

func TestOrderBookSidePointerDelta(t *testing.T) {
	asks := NewAsks([][]any{}, nil)
	asks.StoreArray([]any{ptrF(100.0), ptrF(1.0)})
	// the same price arriving flat must replace, not duplicate
	asks.StoreArray([]any{100.0, 2.0})
	if asks.Len() != 1 {
		t.Fatalf("pointer-priced level duplicated: Len=%d, want 1\n%s", asks.Len(), asks.String())
	}
	if got := asks.GetData()[0][1]; got != 2.0 {
		t.Fatalf("size not replaced: got %v, want 2", got)
	}
	assertFlatRows(t, "plain side", asks.GetData())
	// zero-size delete arriving as pointers must remove the level
	asks.StoreArray([]any{ptrF(100.0), ptrF(0.0)})
	if asks.Len() != 0 {
		t.Fatalf("pointer-priced delete was a no-op: Len=%d, want 0", asks.Len())
	}
}

func TestCountedOrderBookSidePointerDelta(t *testing.T) {
	bids := NewCountedBids([][]any{}, nil)
	bids.StoreArray([]any{ptrF(50.0), ptrF(1.0), ptrI(3)})
	bids.StoreArray([]any{50.0, 2.0, int64(4)})
	if bids.Len() != 1 {
		t.Fatalf("pointer-priced counted level duplicated: Len=%d, want 1", bids.Len())
	}
	row := bids.GetData()[0]
	if row[1] != 2.0 || row[2] != int64(4) {
		t.Fatalf("counted row not replaced: got %v", row)
	}
	assertFlatRows(t, "counted side", bids.GetData())
	bids.StoreArray([]any{ptrF(50.0), ptrF(0.0), ptrI(0)})
	if bids.Len() != 0 {
		t.Fatalf("pointer-priced counted delete was a no-op: Len=%d, want 0", bids.Len())
	}
}

// mirrors the luno sequence: snapshot rows and create/delete deltas built from
// Safe* pointer locals, deletes keyed by a flat id string
func TestIndexedOrderBookSidePointerDelta(t *testing.T) {
	asks := NewIndexedAsks([][]any{}, nil)
	// snapshot seeding with pointer rows
	asks.StoreArray([]any{ptrF(100.0), ptrF(1.0), ptrS("BXA1")})
	asks.StoreArray([]any{ptrF(101.0), ptrF(1.0), ptrS("BXA2")})
	if asks.Len() != 2 || len(asks.Hashmap) != 2 {
		t.Fatalf("seed: Len=%d hashmap=%d, want 2/2", asks.Len(), len(asks.Hashmap))
	}
	assertFlatRows(t, "indexed seed", asks.GetData())
	// same id, same price, new size, arriving as fresh pointers: replace in place
	asks.StoreArray([]any{ptrF(100.0), ptrF(2.0), ptrS("BXA1")})
	if asks.Len() != 2 {
		t.Fatalf("pointer-id replace duplicated the row: Len=%d, want 2\n%s", asks.Len(), asks.String())
	}
	if got := asks.GetData()[0][1]; got != 2.0 {
		t.Fatalf("size not replaced: got %v, want 2", got)
	}
	// same id moving to a new price: exactly one row must survive
	asks.StoreArray([]any{ptrF(102.0), ptrF(2.0), ptrS("BXA1")})
	if asks.Len() != 2 {
		t.Fatalf("pointer-id move duplicated the row: Len=%d, want 2\n%s", asks.Len(), asks.String())
	}
	// zero-size delete by flat id must find the pointer-seeded entry
	asks.StoreArray([]any{0.0, 0.0, "BXA1"})
	if asks.Len() != 1 || len(asks.Hashmap) != 1 {
		t.Fatalf("flat-id delete was a no-op: Len=%d hashmap=%d, want 1/1\n%s", asks.Len(), len(asks.Hashmap), asks.String())
	}
	// zero-size delete by pointer id must find the remaining entry
	asks.StoreArray([]any{ptrF(0.0), ptrF(0.0), ptrS("BXA2")})
	if asks.Len() != 0 || len(asks.Hashmap) != 0 {
		t.Fatalf("pointer-id delete was a no-op: Len=%d hashmap=%d, want 0/0\n%s", asks.Len(), len(asks.Hashmap), asks.String())
	}
}

// nil pointers must keep the documented nil semantics of the indexed side:
// a nil size is a removal, a nil price is recovered from the hashmap. This is
// the bitmex orderBookL2 shape (updates and deletes arrive by id without a
// price): before derefDelta a nil *float64 reached normalizeNumber as a typed
// pointer and panicked ("unsupported type *float64"), killing the consumer on
// the first live update frame
func TestIndexedOrderBookSideNilPointerDelta(t *testing.T) {
	asks := NewIndexedAsks([][]any{}, nil)
	asks.StoreArray([]any{ptrF(100.0), ptrF(1.0), ptrS("id1")})
	// price-less update through a nil *float64: recover price from the hashmap
	asks.StoreArray([]any{(*float64)(nil), ptrF(3.0), ptrS("id1")})
	if asks.Len() != 1 {
		t.Fatalf("nil-price pointer update corrupted the book: Len=%d, want 1", asks.Len())
	}
	if got := asks.GetData()[0][1]; got != 3.0 {
		t.Fatalf("nil-price update did not replace size: got %v, want 3", got)
	}
	// size-less delta through a nil *float64 is a removal
	asks.StoreArray([]any{ptrF(100.0), (*float64)(nil), ptrS("id1")})
	if asks.Len() != 0 || len(asks.Hashmap) != 0 {
		t.Fatalf("nil-size pointer delete was a no-op: Len=%d hashmap=%d, want 0/0", asks.Len(), len(asks.Hashmap))
	}
}
