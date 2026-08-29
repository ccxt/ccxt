package base

import (
	ccxtpro "github.com/ccxt/ccxt/go/v4/pro"
)

// this test ensures we have all types defined in ccxtpro and we don't need to import ccxt just for types
// this function does not need to be called, it's just for type checking

func TestTypesPro() {

	binanceExchange := ccxtpro.NewBinance(nil)

	_, _ = binanceExchange.WatchTrades("BTC/USDT", ccxtpro.WithWatchTradesLimit(5))

	_, _ = binanceExchange.FetchTrades("BTC/USDT", ccxtpro.WithFetchTradesLimit(5))

	binanceI := ccxtpro.CreateExchange("binance", nil)

	_, _ = binanceI.WatchTrades("BTC/USDT", ccxtpro.WithWatchTradesLimit(5))

	_, _ = binanceI.FetchTrades("BTC/USDT", ccxtpro.WithFetchTradesLimit(5))
}
