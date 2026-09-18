package ccxt

import "testing"

// Regression: generated pro handlers write the ws orderbook timestamp via
// AddElementToObject(orderbook, "timestamp", this.SafeInteger(msg, "E")).
// SafeInteger now returns *int64, and AddElementToObject derefs every value
// before the reflective struct path, so an int64 must still land in the
// *int64 Timestamp field instead of being dropped (13 STATIC_WS failures).
func TestAddElementToObjectOrderBookPointerFields(t *testing.T) {
	ob := NewWsOrderBook(snapshotFixture(), nil)

	ts := int64(1786541223727)
	AddElementToObject(ob, "timestamp", &ts)
	if ob.Timestamp == nil || *ob.Timestamp != ts {
		t.Fatalf("timestamp from *int64: got %v want %d", ob.Timestamp, ts)
	}

	ts2 := int64(1786541223799)
	AddElementToObject(ob, "timestamp", ts2)
	if ob.Timestamp == nil || *ob.Timestamp != ts2 {
		t.Fatalf("timestamp from int64: got %v want %d", ob.Timestamp, ts2)
	}
	if got := ob.GetValue("timestamp", nil); got != ts2 {
		t.Fatalf("GetValue(timestamp): got %v want %d", got, ts2)
	}

	nonce := int64(42)
	AddElementToObject(ob, "nonce", &nonce)
	if ob.Nonce != nonce {
		t.Fatalf("nonce from *int64: got %v want %d", ob.Nonce, nonce)
	}

	var absent *int64
	AddElementToObject(ob, "timestamp", absent)
	if ob.Timestamp == nil || *ob.Timestamp != ts2 {
		t.Fatalf("typed-nil timestamp must be a no-op, got %v", ob.Timestamp)
	}
}
