package base

import (
	"fmt"
	"reflect"

	ccxt "github.com/ccxt/ccxt/go/v4"
	ccxtpro "github.com/ccxt/ccxt/go/v4/pro"
)

func TestExchangeStruct(types reflect.Type, links map[string]interface{}) {
	for i := 0; i < types.NumField(); i++ {
		field := types.Field(i)

		val, ok := links[field.Name]
		if ok {
			Assert(field.Type.String(), val, fmt.Sprintf("Field %s type mismatch", field.Name))
		} else {
			panic(fmt.Sprintf("Field %s not found in links", field.Name))
		}
	}
}

// the typed sync methods (FetchTicker) and the channel methods (FetchTickerAsync) live on the
// same struct: a regular venue embeds Exchange plus an exchangeTyped delegate for the unified
// methods it does not override, a derived venue embeds its parent by value, and a ws venue embeds
// its REST twin by pointer.
func TestStructs() {

	restLinks := map[string]map[string]interface{}{
		"binance": map[string]interface{}{
			"Exchange":      "ccxt.Exchange",
			"exchangeTyped": "*ccxt.ExchangeTyped",
		},
		"binanceusdm": map[string]interface{}{
			"Binance": "ccxt.Binance",
		},
		"myokx": map[string]interface{}{
			"Okx": "ccxt.Okx",
		},
	}

	wsLinks := map[string]map[string]interface{}{
		"binance": map[string]interface{}{
			"Binance": "*ccxt.Binance",
			"base":    "*ccxt.Binance",
		},
		"binanceusdm": map[string]interface{}{
			"Binance": "*ccxtpro.Binance",
			"base":    "*ccxtpro.Binance",
		},
		"myokx": map[string]interface{}{
			"Okx":  "*ccxtpro.Okx",
			"base": "*ccxtpro.Okx",
		},
	}

	// test REST structs
	binance := ccxt.NewBinance(nil)         // regular
	binanceusdm := ccxt.NewBinanceusdm(nil) // derived from binance
	myokx := ccxt.NewMyokx(nil)             // alias of okx

	TestExchangeStruct(reflect.TypeOf(binance).Elem(), restLinks["binance"])
	TestExchangeStruct(reflect.TypeOf(binanceusdm).Elem(), restLinks["binanceusdm"])
	TestExchangeStruct(reflect.TypeOf(myokx).Elem(), restLinks["myokx"])

	// both method flavours are reachable on the one struct, and the derived venue promotes them
	var _ func(...any) <-chan any = binance.FetchTimeAsync
	var _ func(...any) (int64, error) = binance.FetchTime
	var _ func(...any) <-chan any = binanceusdm.FetchTimeAsync
	var _ func(...any) (int64, error) = binanceusdm.FetchTime

	//test WS structs
	binanceWs := ccxtpro.NewBinance(nil)         // regular
	binanceusdmWs := ccxtpro.NewBinanceusdm(nil) // derived from binance
	myokxWs := ccxtpro.NewMyokx(nil)             // alias of okx

	TestExchangeStruct(reflect.TypeOf(binanceWs).Elem(), wsLinks["binance"])
	TestExchangeStruct(reflect.TypeOf(binanceusdmWs).Elem(), wsLinks["binanceusdm"])
	TestExchangeStruct(reflect.TypeOf(myokxWs).Elem(), wsLinks["myokx"])

	var _ func(string, ...ccxt.WatchTickerOptions) (ccxt.Ticker, error) = binanceWs.WatchTicker
	var _ func(...any) (int64, error) = binanceWs.FetchTime

	fmt.Println("Structs tests passed!")
}
