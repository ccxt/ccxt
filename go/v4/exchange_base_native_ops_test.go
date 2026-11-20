package ccxt

import (
	"strings"
	"testing"
)

func TestArrayCacheGetLimitTypedCount(t *testing.T) {
	cache := NewArrayCache(nil)
	cache.Append(map[string]any{"symbol": "A", "price": 1})
	cache.Append(map[string]any{"symbol": "A", "price": 2})
	cache.Append(map[string]any{"symbol": "B", "price": 3})
	if got := cache.GetLimit("A", int64(1)); got == nil || *got != 1 {
		t.Fatalf("min(count, limit) = %v, want 1", got)
	}
	if got := cache.GetLimit(nil, nil); got == nil || *got != 3 {
		t.Fatalf("all updates = %v, want 3", got)
	}
	if got := cache.GetLimit("C", nil); got != nil {
		t.Fatalf("unknown symbol without limit = %v, want nil", *got)
	}
	if got := cache.GetLimit("C", int64(5)); got == nil || *got != 5 {
		t.Fatalf("unknown symbol answers the limit, got %v", got)
	}
}

func TestOptionAndParamsNilFallbacks(t *testing.T) {
	ex := &BaseExchange{}
	ex.Options = map[string]any{"m": map[string]any{}, "opt": "fromOptions"}
	value, _ := ex.optionAndParams(map[string]any{}, "m", "opt", "dflt")
	if value != "fromOptions" {
		t.Fatalf("option fallback = %v", value)
	}
	ex.Options = map[string]any{}
	value, _ = ex.optionAndParams(map[string]any{}, "m", "opt", "dflt")
	if value != "dflt" {
		t.Fatalf("default fallback = %v", value)
	}
	var none *string
	value, _ = ex.optionAndParams(map[string]any{}, "m", "opt", none)
	if value != nil {
		t.Fatalf("typed nil default must read as nil, got %v", value)
	}
}

func TestHandleMarketTypeMethodOptions(t *testing.T) {
	ex := &BaseExchange{}
	ex.Options = map[string]any{"fetchX": "swap", "fetchY": map[string]any{"type": "future"}}
	// a string method option is not a dictionary: SafeDict skips it, the default type answers
	if got, _ := ex.HandleMarketTypeAndParams("fetchX"); got == nil || *got != "spot" {
		t.Fatalf("string method option: got %v, want spot", got)
	}
	if got, _ := ex.HandleMarketTypeAndParams("fetchY"); got == nil || *got != "future" {
		t.Fatalf("dict method option: got %v, want future", got)
	}
}

func TestHandleHttpStatusCodeMessage(t *testing.T) {
	ex := &BaseExchange{Id: "x"}
	var msg string
	ex.HttpExceptions = map[string]any{"429": func(args ...any) error {
		msg = args[0].(string)
		return nil
	}}
	func() {
		defer func() { recover() }()
		ex.HandleHttpStatusCode(429, "Too Many Requests", "https://u", "GET", map[string]any{"a": "b"})
	}()
	if msg != "x GET https://u 429 Too Many Requests {a: b}" {
		t.Fatalf("message = %q", msg)
	}
	ex.HandleHttpStatusCode(200, "OK", "https://u", "GET", nil) // not in the table: no panic
	if !strings.HasPrefix(msg, "x GET") {
		t.Fatalf("unexpected rewrite %q", msg)
	}
}
