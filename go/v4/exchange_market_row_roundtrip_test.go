package ccxt

import (
	"reflect"
	"testing"
)

// Every key setMarkets / safeMarketStructure / safeMarket and safeCurrencyStructure write must
// survive map -> struct -> map with the same value; keys the input lacks may come back nil.
func assertRowKeysSurvive(t *testing.T, label string, in map[string]any, out map[string]any) {
	t.Helper()
	for k, want := range in {
		got, ok := out[k]
		if !ok {
			t.Errorf("%s: key %q dropped by the round trip", label, k)
			continue
		}
		if wm, isMap := want.(map[string]any); isMap {
			gm, gotMap := got.(map[string]any)
			if !gotMap {
				t.Errorf("%s: key %q = %#v; want a map", label, k, got)
				continue
			}
			assertRowKeysSurvive(t, label+"."+k, wm, gm)
			continue
		}
		if !reflect.DeepEqual(got, want) {
			t.Errorf("%s: key %q = %#v; want %#v", label, k, got, want)
		}
	}
}

func fullMarketRow() map[string]any {
	minMax := func(lo, hi float64) map[string]any { return map[string]any{"min": lo, "max": hi} }
	row := map[string]any{}
	row["id"] = "BTCUSDT"
	row["lowercaseId"] = "btcusdt"
	row["uppercaseId"] = "BTCUSDT"
	row["numericId"] = float64(7)
	row["symbol"] = "BTC/USDT:USDT"
	row["base"] = "BTC"
	row["quote"] = "USDT"
	row["settle"] = "USDT"
	row["baseId"] = "btc"
	row["quoteId"] = "usdt"
	row["settleId"] = "usdt"
	row["marketId"] = "BTCUSDT"
	row["type"] = "swap"
	row["subType"] = "linear"
	row["spot"] = false
	row["margin"] = true
	row["swap"] = true
	row["future"] = false
	row["option"] = false
	row["index"] = false
	row["stock"] = false
	row["prediction"] = false
	row["active"] = true
	row["contract"] = true
	row["linear"] = true
	row["inverse"] = false
	row["quanto"] = false
	row["taker"] = 0.0004
	row["maker"] = 0.0002
	row["percentage"] = true
	row["tierBased"] = false
	row["contractSize"] = 1.0
	row["expiry"] = int64(1700000000000)
	row["expiryDatetime"] = "2023-11-14T22:13:20.000Z"
	row["strike"] = 30000.0
	row["optionType"] = "call"
	row["created"] = int64(1600000000000)
	row["baseName"] = "BTC"
	row["id2"] = "BTC-USDT"
	row["instIdCode"] = int64(42)
	row["tiers"] = map[string]any{"taker": []any{}}
	row["market"] = "m"
	row["marketType"] = "binary"
	row["executionModel"] = "clob"
	row["collateral"] = "USDC"
	row["resolved"] = false
	row["resolvedOutcome"] = "yes"
	row["info"] = map[string]any{"raw": "x", "nested": map[string]any{"a": "1"}}
	row["feeSide"] = "quote"
	row["precision"] = map[string]any{"amount": 0.001, "price": 0.1, "cost": 0.01, "base": 1e-8, "quote": 1e-6}
	row["limits"] = map[string]any{"leverage": minMax(1, 125), "amount": minMax(0.001, 1000), "price": minMax(0.1, 1e6), "cost": minMax(5, 1e7), "market": minMax(0.001, 120)}
	row["marginModes"] = map[string]any{"cross": true, "isolated": false}
	return row
}

func TestMarketInterfaceRoundTripCarriesEveryWrittenKey(t *testing.T) {
	in := fullMarketRow()
	assertRowKeysSurvive(t, "market", in, MarketInterfaceToMap(NewMarketInterface(in)))
}

func TestMarketInterfaceRoundTripKeepsInfoVerbatim(t *testing.T) {
	info := map[string]any{"symbol": "BTCUSDT", "filters": []any{map[string]any{"t": "LOT"}}}
	out := MarketInterfaceToMap(NewMarketInterface(map[string]any{"id": "BTCUSDT", "info": info}))
	if !reflect.DeepEqual(out["info"], info) {
		t.Errorf("info = %#v; want %#v", out["info"], info)
	}
}

func TestMarketInterfaceRoundTripNullOptionals(t *testing.T) {
	// the clean safeMarketStructure () row: optionals undefined, flags false
	nils := []string{
		"id", "lowercaseId", "symbol", "base", "quote", "settle", "baseId", "quoteId", "settleId",
		"type", "margin", "index", "active", "linear", "inverse", "subType", "taker", "maker",
		"contractSize", "expiry", "expiryDatetime", "strike", "optionType", "created", "info",
	}
	in := map[string]any{"spot": false, "swap": false, "future": false, "option": false, "contract": false}
	in["precision"] = map[string]any{"amount": nil, "price": nil, "cost": nil, "base": nil, "quote": nil}
	in["marginModes"] = map[string]any{"cross": nil, "isolated": nil}
	nullMinMax := func() map[string]any { return map[string]any{"min": nil, "max": nil} }
	in["limits"] = map[string]any{"leverage": nullMinMax(), "amount": nullMinMax(), "price": nullMinMax(), "cost": nullMinMax()}
	for _, k := range nils {
		in[k] = nil
	}
	out := MarketInterfaceToMap(NewMarketInterface(in))
	assertRowKeysSurvive(t, "nullMarket", in, out)
	if _, ok := out["marketId"]; ok {
		t.Errorf("marketId present on a row that never had it")
	}
}

func fullCurrencyRow() map[string]any {
	minMax := func(lo, hi float64) map[string]any { return map[string]any{"min": lo, "max": hi} }
	network := map[string]any{}
	network["info"] = map[string]any{"chain": "ERC20"}
	network["id"] = "eth"
	network["network"] = "ERC20"
	network["fee"] = 0.5
	network["active"] = true
	network["deposit"] = true
	network["withdraw"] = false
	network["precision"] = 1e-6
	network["limits"] = map[string]any{"amount": minMax(1, 10), "deposit": minMax(0.1, 1e6), "withdraw": minMax(2, 5e5)}
	row := map[string]any{}
	row["info"] = map[string]any{"coin": "USDT"}
	row["id"] = "usdt"
	row["numericId"] = int64(3)
	row["code"] = "USDT"
	row["precision"] = 1e-6
	row["type"] = "crypto"
	row["name"] = "Tether"
	row["active"] = true
	row["deposit"] = true
	row["withdraw"] = false
	row["fee"] = 1.0
	row["margin"] = true
	row["valueScale"] = int64(8)
	row["fees"] = map[string]any{"ERC20": 0.5}
	row["networks"] = map[string]any{"ERC20": network}
	row["limits"] = map[string]any{"amount": minMax(1, 100), "deposit": minMax(0.1, 1e6), "withdraw": minMax(2, 5e5)}
	return row
}

func TestCurrencyRoundTripCarriesEveryWrittenKey(t *testing.T) {
	in := fullCurrencyRow()
	assertRowKeysSurvive(t, "currency", in, CurrencyToMap(NewCurrency(in)))
}

func TestCurrencyRoundTripNullOptionals(t *testing.T) {
	// the clean safeCurrencyStructure () row
	in := map[string]any{}
	in["info"] = nil
	in["id"] = nil
	in["numericId"] = nil
	in["code"] = nil
	in["precision"] = nil
	in["type"] = nil
	in["name"] = nil
	in["active"] = nil
	in["deposit"] = nil
	in["withdraw"] = nil
	in["fee"] = nil
	in["limits"] = map[string]any{"deposit": map[string]any{"min": nil, "max": nil}, "withdraw": map[string]any{"min": nil, "max": nil}}
	assertRowKeysSurvive(t, "nullCurrency", in, CurrencyToMap(NewCurrency(in)))
}
