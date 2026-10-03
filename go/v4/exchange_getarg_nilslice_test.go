package ccxt

import (
	"reflect"
	"testing"
)

// Generated wrappers bind `symbols` as a typed `[]string` and pass it straight into the
// `...any` body (e.g. `WatchLiquidationsForSymbols(symbols []string, ...)` ->
// `WatchLiquidationsForSymbolsAsync(symbols, ...)` -> `MarketSymbols(symbols, ...)`).
// A nil `[]string` boxed into `any` is NOT `== nil`, so without the `[]string` unwrapping
// in GetArg a caller passing nil gets `[]string(nil)` back instead of an untyped nil.
//
// That divergence is observable downstream: `MarketSymbols` returns its input untouched
// for the nil/empty cases, and the pro implementations then branch on it in two different
// shapes. `IsEqual(symbols, nil)` has no `[]string` case and falls through to `false`, so
// an okx-shaped guard silently took the per-symbol branch over an empty list and
// subscribed to nothing instead of the all-symbols stream.
//
// This is the regression the `[]string` block in GetArg fixes; the whole go/v4 suite
// passes with that block reverted, so without these assertions nothing guards it.
func TestGetArgUnwrapsNilTypedSlice(t *testing.T) {
	def := any("DEFAULT")

	var nilSlice []string
	if got := GetArg([]any{nilSlice}, 0, def); !reflect.DeepEqual(got, def) {
		t.Errorf("nil []string -> %#v, want default %#v", got, def)
	}

	// Negative controls: the fix must not swallow real inputs. A non-nil empty slice is
	// deliberately NOT collapsed to the default -- the empty-vs-absent decision belongs to
	// MarketSymbols/allowEmpty, which throws ArgumentsRequired for allowEmpty:false callers.
	empty := []string{}
	if got := GetArg([]any{empty}, 0, def); !reflect.DeepEqual(got, empty) {
		t.Errorf("empty []string -> %#v, want %#v", got, empty)
	}
	full := []string{"BTC/USDT", "ETH/USDT"}
	if got := GetArg([]any{full}, 0, def); !reflect.DeepEqual(got, full) {
		t.Errorf("populated []string -> %#v, want %#v", got, full)
	}
}

// End-to-end shape of the bug: a nil []string must reach the pro watch* bodies as an
// untyped nil so that BOTH all-symbols guard shapes used across the pro implementations
// agree it means "all symbols".
//
//	binance/bitmex: if this.IsEmpty(symbols)        { ...all-symbols stream... }
//	okx:            if !IsEqual(symbols, nil) { ...per symbol... } else { ...all symbols... }
//
// The okx shape is the load-bearing one: IsEqual has no []string case, so before the fix
// a nil []string made it take the per-symbol branch over an empty list.
func TestMarketSymbolsNilTypedSliceMeansAllSymbols(t *testing.T) {
	exchange := &BaseExchange{}

	var nilSlice []string
	symbols := exchange.MarketSymbols(GetArg([]any{nilSlice}, 0, nil), nil, true, true)

	if symbols != nil {
		t.Errorf("MarketSymbols(nil []string) -> %#v, want untyped nil", symbols)
	}
	if !IsEqual(symbols, nil) {
		t.Error("okx-shaped guard: IsEqual(symbols, nil) is false, so watchLiquidationsForSymbols(nil) " +
			"takes the per-symbol branch over an empty list and subscribes to nothing")
	}
	if !exchange.IsEmpty(symbols) {
		t.Error("binance/bitmex-shaped guard: IsEmpty(symbols) is false, so the all-symbols stream is not selected")
	}

	// Negative control: an explicit symbol list must still take the per-symbol branch.
	full := []string{"BTC/USDT"}
	passed := GetArg([]any{full}, 0, nil)
	if !reflect.DeepEqual(passed, full) {
		t.Errorf("populated []string -> %#v, want %#v", passed, full)
	}
	if IsEqual(passed, nil) || exchange.IsEmpty(passed) {
		t.Error("a populated symbol list must not be treated as the all-symbols case")
	}
}
