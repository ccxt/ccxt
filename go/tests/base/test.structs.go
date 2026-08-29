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

func TestStructs() {

	restLinks := map[string]map[string]interface{}{
		"binance": map[string]interface{}{
			"BinanceCore":   "*ccxt.BinanceCore",
			"Core":          "*ccxt.BinanceCore",
			"exchangeTyped": "*ccxt.ExchangeTyped",
		},
		"binanceusdm": map[string]interface{}{
			"BinanceusdmCore": "*ccxt.BinanceusdmCore",
			"Core":            "*ccxt.ExchangeCore",
			"exchangeTyped":   "*ccxt.Binance",
		},
		"myokx": map[string]interface{}{
			"MyokxCore":     "*ccxt.MyokxCore",
			"Core":          "*ccxt.MyokxCore",
			"exchangeTyped": "*ccxt.Okx",
		},
	}

	wsLinks := map[string]map[string]interface{}{
		"binance": map[string]interface{}{
			"BinanceCore":   "*ccxtpro.BinanceCore",
			"Core":          "*ccxtpro.BinanceCore",
			"exchangeTyped": "*ccxt.Binance",
		},
		"binanceusdm": map[string]interface{}{
			"BinanceusdmCore": "*ccxtpro.BinanceusdmCore",
			"Core":            "*ccxtpro.ExchangeCore",
			"exchangeTyped":   "*ccxt.Binance",
		},
		"myokx": map[string]interface{}{
			"MyokxCore":     "*ccxtpro.MyokxCore",
			"Core":          "*ccxtpro.MyokxCore",
			"exchangeTyped": "*ccxt.Okx",
		},
	}

	// test REST structs
	binance := ccxt.NewBinance(nil)         // regular
	binanceusdm := ccxt.NewBinanceusdm(nil) // derived from binance
	myokx := ccxt.NewMyokx(nil)             // alias of okx

	TestExchangeStruct(reflect.TypeOf(*binance), restLinks["binance"])
	TestExchangeStruct(reflect.TypeOf(*binanceusdm), restLinks["binanceusdm"])
	TestExchangeStruct(reflect.TypeOf(*myokx), restLinks["myokx"])

	//test WS structs
	binanceWs := ccxtpro.NewBinance(nil)         // regular
	binanceusdmWs := ccxtpro.NewBinanceusdm(nil) // derived from binance
	myokxWs := ccxtpro.NewMyokx(nil)             // alias of okx

	TestExchangeStruct(reflect.TypeOf(*binanceWs), wsLinks["binance"])
	TestExchangeStruct(reflect.TypeOf(*binanceusdmWs), wsLinks["binanceusdm"])
	TestExchangeStruct(reflect.TypeOf(*myokxWs), wsLinks["myokx"])

	fmt.Println("Structs tests passed!")
}
