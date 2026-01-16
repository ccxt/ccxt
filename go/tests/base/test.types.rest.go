package base

import ccxt "github.com/ccxt/ccxt/go/v4"

// this test ensures we have all types defined in ccxt, alias exchanges, etc

func TestTypesRest() {

	binanceExchange := ccxt.NewBinance(nil)

	_, _ = binanceExchange.FetchTrades("BTC/USDT", ccxt.WithFetchTradesLimit(5))

	binanceI := ccxt.CreateExchange("binance", nil)

	_, _ = binanceI.FetchTrades("BTC/USDT", ccxt.WithFetchTradesLimit(5))

	myokx := ccxt.NewMyokx(nil)

	_, _ = myokx.FetchOrder("iddd", ccxt.WithFetchOrderSymbol("BTC/USDT")) // ensure myokx has access to a method that does not implement directly, like fetchOrder

}
