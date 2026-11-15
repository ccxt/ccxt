package ccxt

import (
	"fmt"
	"math"
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
	for _, v := range []any{int64(1), float64(1.0), float64(3), int64(-2), float64(-4.0), int64(0)} {
		if !ex.IsRoundNumber(v) {
			t.Errorf("IsRoundNumber(%T %v) = false", v, v)
		}
	}
	if ex.IsRoundNumber(Divide(int64(90000), int64(60000))) {
		t.Errorf("IsRoundNumber(1.5) = true")
	}
	for _, v := range []any{float64(1.5), float64(-2.25), math.NaN()} {
		if ex.IsRoundNumber(v) {
			t.Errorf("IsRoundNumber(%T %v) = true", v, v)
		}
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

// bingx/hyperliquid/kucoin/derive: fetchMarkets over typed sub-fetches must not read as empty
func typedMarketsTask(symbol string) <-chan AsyncResult[[]MarketInterface] {
	ch := make(chan AsyncResult[[]MarketInterface], 1)
	ch <- AsyncResult[[]MarketInterface]{Value: MarketInterfacesFromList([]any{map[string]any{
		"id": symbol, "symbol": symbol, "base": "BTC", "quote": "USDT", "type": "spot", "spot": true,
	}})}
	close(ch)
	return ch
}

// bingx/hyperliquid/kucoin shape: promiseAll over typed `<-chan AsyncResult[[]MarketInterface]`
// cores, then SafeListTypedDefault / SafeList + ArrayConcat over the result list.
func TestPromiseAllTypedMarketListsConcat(t *testing.T) {
	e := &BaseExchange{}
	r := <-promiseAll([]any{typedMarketsTask("BTC/USDT"), typedMarketsTask("ETH/USDT")})
	if r.Err != nil {
		t.Fatal(r.Err)
	}
	promises := ListTyped(r.Value)
	first := SafeListTypedDefault(promises, 0, []any{})    // bingx form
	second := ArrayTyped(e.SafeList(promises, 1, []any{})) // hyperliquid / kucoin form
	all := e.ArrayConcat(first, second)
	if len(all) != 2 {
		t.Fatalf("typed sub-fetch results dropped by promiseAll consumers: got %d markets (elem %T), want 2", len(all), promises[0])
	}
	if s := e.SafeString(all[0], "symbol"); s == nil || *s != "BTC/USDT" {
		t.Fatalf("market row not readable as a dict: %#v", all[0])
	}
}

// derive shape: getMarketsPaginated (TS Promise<Dict[]>, raw instruments) must not be
// retyped to []MarketInterface, which drops every raw key before ParseMarkets runs.
func TestDeriveLoadMarketsFromMockedResponse(t *testing.T) {
	ex := NewDerive(map[string]any{})
	ex.SetFetchResponse(map[string]any{
		"id": "x",
		"result": map[string]any{
			"instruments": []any{map[string]any{
				"instrument_type": "perp", "instrument_name": "ZEC-PERP", "is_active": true,
				"tick_size": "0.01", "minimum_amount": "1", "maximum_amount": "100000", "amount_step": "0.01",
				"maker_fee_rate": "0.0001", "taker_fee_rate": "0.0003", "base_currency": "ZEC", "quote_currency": "USDC",
				"scheduled_activation": 1780572941, "scheduled_deactivation": 9223372036854775807,
				"perp_details": map[string]any{"index": "ZEC-USD"},
			}},
			"pagination": map[string]any{"num_pages": 1, "count": 1},
		},
	})
	if _, err := ex.LoadMarkets(); err != nil {
		t.Fatal(err)
	}
	if len(ex.GetSymbols()) == 0 {
		t.Fatalf("derive LoadMarkets produced no symbols")
	}
}

// Precise.ToString (phemex fromEn, bitget) must match ts/src/base/Precise.ts toString
func TestPreciseToStringMatchesTs(t *testing.T) {
	cases := []struct {
		n    string
		dec  int64
		want string
	}{
		{"150000000", 8, "1.5"}, {"123450000", 4, "12345"}, {"10000", 8, "0.0001"}, {"-15", 1, "-1.5"},
		{"-5", 3, "-0.005"}, {"12", -2, "1200"}, {"0", 5, "0"}, {"123", 3, "0.123"}, {"1234", 2, "12.34"},
	}
	for _, c := range cases {
		pr := NewPrecise(c.n)
		pr.Decimals = (&BaseExchange{}).Sum(pr.Decimals, c.dec)
		if got := pr.ToString(); got != c.want {
			t.Errorf("Precise(%s, +%d).ToString() = %q, want %q", c.n, c.dec, got, c.want)
		}
	}
}

// sxbet fetchEvent: info is the raw list of fixture markets; the typed event must keep it
func TestPredictionEventKeepsListInfo(t *testing.T) {
	raw := []any{map[string]any{"marketHash": "0xabc"}}
	ev := NewPredictionEvent(map[string]any{"id": "f1", "title": "x", "markets": []any{}, "info": raw})
	if got, ok := PredictionEventToMap(ev)["info"].([]any); !ok || len(got) != 1 {
		t.Fatalf("event info dropped: %#v", ev.Info)
	}
}

// myriad / limitless / predictfun sign: yParity and chainId reach intToRlpHex as SafeInteger's
// *int64; 0 is the empty byte string and 137 is "89" (was "00"-style / empty for every value)
func TestIntToRlpHexOfSafeInteger(t *testing.T) {
	ex := &PredictionExchange{}
	row := map[string]any{"zero": int64(0), "one": int64(1), "chain": int64(137), "big": int64(4096)}
	cases := []struct{ key, want string }{{"zero", ""}, {"one", "01"}, {"chain", "89"}, {"big", "1000"}}
	for _, c := range cases {
		if got := ex.IntToRlpHex(ex.SafeInteger(row, c.key)); got != c.want {
			t.Errorf("IntToRlpHex(SafeInteger %s) = %#v, want %q", c.key, got, c.want)
		}
	}
}

// CountedOrderBookSide.StoreArray: a zero count deletes the level whatever numeric kind it has
func TestCountedOrderBookSideZeroCountDeletes(t *testing.T) {
	for _, zero := range []any{float64(0), int64(0), int(0)} {
		side := NewCountedOrderBookSide(false, []any{}, nil)
		side.StoreArray([]any{float64(100), float64(1), float64(3)})
		side.StoreArray([]any{float64(100), float64(1), zero})
		if side.Length != 0 {
			t.Errorf("count %T 0 kept the level: length %d", zero, side.Length)
		}
	}
}

// JS truthiness: every numeric zero (and NaN) is falsy whatever its Go kind
func TestEvalTruthyNumericZeroIsFalsy(t *testing.T) {
	for _, v := range []any{int(0), int32(0), int64(0), uint(0), uint32(0), uint64(0), float32(0), float64(0), math.NaN()} {
		if EvalTruthy(v) {
			t.Errorf("EvalTruthy(%T %v) = true", v, v)
		}
	}
	for _, v := range []any{int64(2), float64(0.5), int(-1)} {
		if !EvalTruthy(v) {
			t.Errorf("EvalTruthy(%T %v) = false", v, v)
		}
	}
}
