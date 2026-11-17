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

func TestAddElementToObjectOrderBookUndefinedClears(t *testing.T) {
	ob := NewWsOrderBook(snapshotFixture(), nil)
	AddElementToObject(ob, "nonce", int64(601))
	AddElementToObject(ob, "nonce", nil)
	if ob.Nonce != nil {
		t.Fatalf("undefined nonce must clear the field, got %v", ob.Nonce)
	}
}

func TestOrderBookFieldSetters(t *testing.T) {
	var ob OrderBookInterface = NewWsOrderBook(snapshotFixture(), nil)
	ts := int64(1786541223727)
	nonce := int64(7)
	datetime := "2026-01-01T00:00:00.000Z"
	symbol := "BTC/USDT"
	ob.SetTimestamp(&ts)
	ob.SetDatetime(&datetime)
	ob.SetNonce(&nonce)
	ob.SetSymbol(&symbol)
	if got := ob.GetValue("timestamp", nil); got != ts {
		t.Fatalf("timestamp: got %v want %d", got, ts)
	}
	if got := ob.GetValue("datetime", nil); got != datetime {
		t.Fatalf("datetime: got %v want %s", got, datetime)
	}
	if got := ob.GetNonce(); got != nonce {
		t.Fatalf("nonce: got %v want %d", got, nonce)
	}
	if got := ob.GetValue("symbol", nil); got != symbol {
		t.Fatalf("symbol: got %v want %s", got, symbol)
	}
	var absentInt *int64
	var absentStr *string
	ob.SetTimestamp(absentInt)
	ob.SetDatetime(absentStr)
	ob.SetNonce(absentInt)
	ob.SetSymbol(absentStr)
	if got := ob.GetValue("timestamp", nil); got != ts {
		t.Fatalf("typed-nil timestamp must be a no-op, got %v", got)
	}
	if got := ob.GetNonce(); got != nonce {
		t.Fatalf("typed-nil nonce must be a no-op, got %v", got)
	}
}
