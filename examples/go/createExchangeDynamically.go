package main

import (
	"ccxt/go/ccxt"
	"fmt"
)

func AbstractExchangeCreation() {
	// instantiate the exchange
	exchanges := []string{"binance", "bybit", "okx"}
	symbol := "BTC/USDT"
	for _, exchangeName := range exchanges {
		exchange := ccxt.CreateExchange(exchangeName, nil)

		ticker, _ := exchange.FetchTicker(symbol)
		fmt.Println("Ticker for", exchangeName, ":", ticker.Last)
	}
}
