package ccxt

import (
	"encoding/json"
	"testing"
)

// ---------------------------------------------------------------------------
// Regression tests for https://github.com/ccxt/ccxt/issues/29586
//
// (a) NewOrderBookFromWs used to type-switch on the concrete *WsOrderBook,
//     which never matches embedding types (*CountedOrderBook,
//     *IndexedOrderBook) in Go, so those silently fell through to the
//     default case and produced empty books with timestamp 0.
// (b) OrderBookSide.Data carried a json tag, so json.Marshal of a live book
//     emitted asks and bids as {"data":[...]} objects instead of plain
//     arrays.
// (c) IndexedOrderBookSide keeps its data in shadowing fields while its
//     embedded OrderBookSide pointer stays nil, so GetDataCopy delegating
//     upward always returned an empty copy and ToMap produced empty sides.
// ---------------------------------------------------------------------------

func snapshotFixture() map[string]any {
	// rows use the []any shape produced by json unmarshaling, the only shape
	// normalizeToFloat64SliceSlice accepts
	return map[string]any{
		"asks":      []any{[]any{101.0, 1.5}, []any{102.0, 2.5}},
		"bids":      []any{[]any{100.0, 3.5}, []any{99.0, 4.5}},
		"timestamp": int64(1723300000000),
		"symbol":    "BTC/USDT",
	}
}

func indexedSnapshotFixture() map[string]any {
	// rows use the []any shape with a trailing numeric count, the shape
	// getIndexedAsksBids accepts, numeric third elements are the case that
	// parseOrderBookEntries silently dropped as 3-float rows
	return map[string]any{
		"asks":      []any{[]any{101.0, 1.5, 3.0}, []any{102.0, 2.5, 4.0}},
		"bids":      []any{[]any{100.0, 3.5, 5.0}, []any{99.0, 4.5, 6.0}},
		"timestamp": int64(1723300000000),
		"symbol":    "BTC/USDT",
	}
}

func indexedIdSnapshotFixture() map[string]any {
	// same shape with string ids, the flavor indexed books usually carry
	return map[string]any{
		"asks":      []any{[]any{101.0, 1.5, "11"}, []any{102.0, 2.5, "12"}},
		"bids":      []any{[]any{100.0, 3.5, "21"}, []any{99.0, 4.5, "22"}},
		"timestamp": int64(1723300000000),
		"symbol":    "BTC/USDT",
	}
}

func assertTypedBookShape(t *testing.T, book OrderBook, label string) {
	t.Helper()
	if len(book.Asks) == 0 {
		t.Fatalf("%s: expected non-empty asks, got %v", label, book.Asks)
	}
	if len(book.Bids) == 0 {
		t.Fatalf("%s: expected non-empty bids, got %v", label, book.Bids)
	}
	if book.Timestamp == nil || *book.Timestamp != int64(1723300000000) {
		t.Fatalf("%s: expected timestamp 1723300000000, got %v", label, book.Timestamp)
	}
	if book.Asks[0][0] != 101.0 {
		t.Fatalf("%s: expected best ask 101.0, got %v", label, book.Asks[0][0])
	}
	if book.Bids[0][0] != 100.0 {
		t.Fatalf("%s: expected best bid 100.0, got %v", label, book.Bids[0][0])
	}
	for _, row := range append(append([][]float64{}, book.Asks...), book.Bids...) {
		if len(row) != 2 {
			t.Fatalf("%s: expected [price, amount] pairs, got row %v", label, row)
		}
	}
}

func TestNewOrderBookFromWsPlainBook(t *testing.T) {
	ws := NewWsOrderBook(snapshotFixture(), nil)
	book := NewOrderBookFromWs(ws)
	assertTypedBookShape(t, book, "WsOrderBook")
}

func TestNewOrderBookFromWsCountedBook(t *testing.T) {
	counted := NewCountedOrderBook(indexedSnapshotFixture(), nil)
	book := NewOrderBookFromWs(counted)
	assertTypedBookShape(t, book, "CountedOrderBook")
}

func TestNewOrderBookFromWsIndexedBook(t *testing.T) {
	indexed := NewIndexedOrderBook(indexedIdSnapshotFixture(), nil)
	book := NewOrderBookFromWs(indexed)
	assertTypedBookShape(t, book, "IndexedOrderBook")
}

func assertMarshaledSidesAreArrays(t *testing.T, book any, label string) {
	t.Helper()
	raw, err := json.Marshal(book)
	if err != nil {
		t.Fatalf("%s: marshal failed: %v", label, err)
	}
	var decoded map[string]json.RawMessage
	if err := json.Unmarshal(raw, &decoded); err != nil {
		t.Fatalf("%s: unmarshal outer failed: %v, raw: %s", label, err, raw)
	}
	for _, key := range []string{"asks", "bids"} {
		side, ok := decoded[key]
		if !ok {
			t.Fatalf("%s: missing %q in marshaled book: %s", label, key, raw)
		}
		// rows may mix numbers and string ids, only the array shape is asserted
		var asArray [][]any
		if err := json.Unmarshal(side, &asArray); err != nil {
			t.Fatalf("%s: %q does not unmarshal as a plain array, got %s", label, key, side)
		}
		if len(asArray) == 0 {
			t.Fatalf("%s: %q marshaled empty, got %s", label, key, side)
		}
	}
}

func TestMarshalLiveWsOrderBookSidesAreArrays(t *testing.T) {
	ws := NewWsOrderBook(snapshotFixture(), nil)
	assertMarshaledSidesAreArrays(t, ws, "WsOrderBook")
}

func TestMarshalLiveCountedOrderBookSidesAreArrays(t *testing.T) {
	counted := NewCountedOrderBook(indexedSnapshotFixture(), nil)
	assertMarshaledSidesAreArrays(t, counted, "CountedOrderBook")
}

func TestMarshalLiveIndexedOrderBookSidesAreArrays(t *testing.T) {
	indexed := NewIndexedOrderBook(indexedSnapshotFixture(), nil)
	assertMarshaledSidesAreArrays(t, indexed, "IndexedOrderBook")
}

func TestIndexedSideGetDataCopyUsesShadowData(t *testing.T) {
	indexed := NewIndexedOrderBook(indexedSnapshotFixture(), nil)
	copied := indexed.Asks.GetDataCopy()
	if len(copied) == 0 {
		t.Fatalf("IndexedOrderBookSide.GetDataCopy returned empty, shadow data lost")
	}
	// mutating the copy must not leak into the live side
	copied[0][0] = -1.0
	live := indexed.Asks.GetData()
	if live[0][0] == -1.0 {
		t.Fatalf("GetDataCopy returned a reference into live data, expected a deep copy")
	}
}

func TestMarshalNilSidesEmitEmptyArrays(t *testing.T) {
	// encoding/json short-circuits nil pointers to null before consulting
	// MarshalJSON, so the nil-receiver guards are exercised by direct calls
	var base *OrderBookSide
	raw, err := base.MarshalJSON()
	if err != nil || string(raw) != "[]" {
		t.Fatalf("nil *OrderBookSide: expected [], got %s err %v", raw, err)
	}
	var indexed *IndexedOrderBookSide
	raw, err = indexed.MarshalJSON()
	if err != nil || string(raw) != "[]" {
		t.Fatalf("nil *IndexedOrderBookSide: expected [], got %s err %v", raw, err)
	}
}

// ---------------------------------------------------------------------------
// Regression test for the master panic reproduced in PR #30224:
// WsOrderBook.Update() asserted timestamp.(int64) / snapshotNonce.(int64) on a
// snapshot that had been through json.Unmarshal, where every JSON number is
// decoded as float64 — so every real ws feed crashed with
// "interface conversion: interface {} is float64, not int64". Update() now
// normalizes both through ParseInt. These cases feed genuinely json-decoded
// snapshots so the regression cannot silently return.
// ---------------------------------------------------------------------------

func jsonDecodedSnapshot(t *testing.T, raw string) map[string]any {
	t.Helper()
	var m map[string]any
	if err := json.Unmarshal([]byte(raw), &m); err != nil {
		t.Fatalf("unmarshal snapshot: %v", err)
	}
	// guard the premise of the regression: json numbers really are float64
	for _, k := range []string{"timestamp", "nonce"} {
		if v, ok := m[k]; ok {
			if _, isFloat := v.(float64); !isFloat {
				t.Fatalf("expected float64 %q from json.Unmarshal, got %T", k, v)
			}
		}
	}
	return m
}

func TestWsOrderBookUpdateJSONDecodedSnapshot(t *testing.T) {
	ob := NewWsOrderBook(map[string]any{"symbol": "BTC/USDT"}, nil)

	snap := jsonDecodedSnapshot(t, `{
		"asks": [[101.0, 1.5], [102.0, 2.5]],
		"bids": [[100.0, 3.5], [99.0, 4.5]],
		"timestamp": 1723300000000,
		"nonce": 42,
		"symbol": "BTC/USDT"
	}`)

	// must not panic on a float64 timestamp / nonce
	ob.Update(snap)

	if ob.Timestamp == nil || *ob.Timestamp != int64(1723300000000) {
		t.Fatalf("expected timestamp 1723300000000, got %v", ob.Timestamp)
	}
	if ob.Datetime != "2024-08-10T14:26:40.000Z" {
		t.Fatalf("expected datetime 2024-08-10T14:26:40.000Z, got %v", ob.Datetime)
	}
	if ParseInt(ob.Nonce) != 42 {
		t.Fatalf("expected nonce 42, got %v (%T)", ob.Nonce, ob.Nonce)
	}
	if len(ob.Bids.GetDataCopy()) != 2 || len(ob.Asks.GetDataCopy()) != 2 {
		t.Fatalf("expected 2 levels per side, got bids=%d asks=%d", len(ob.Bids.GetDataCopy()), len(ob.Asks.GetDataCopy()))
	}

	// a stale update (older nonce) is ignored, leaving the current state intact
	ob.Update(jsonDecodedSnapshot(t, `{"nonce": 7, "timestamp": 1723300009999}`))
	if ob.Timestamp == nil || *ob.Timestamp != int64(1723300000000) {
		t.Fatalf("stale update applied: timestamp is now %v", ob.Timestamp)
	}

	// a newer snapshot without a timestamp clears the stale one (JS base parity:
	// reset() reassigns timestamp/datetime from the snapshot unconditionally)
	ob.Update(jsonDecodedSnapshot(t, `{"nonce": 99, "bids": [[100.0, 1.0]], "asks": []}`))
	if ob.Timestamp != nil || ob.Datetime != nil {
		t.Fatalf("expected timestamp/datetime cleared, got ts=%v dt=%v", ob.Timestamp, ob.Datetime)
	}
	if ParseInt(ob.Nonce) != 99 {
		t.Fatalf("expected nonce 99 after newer update, got %v", ob.Nonce)
	}
}
