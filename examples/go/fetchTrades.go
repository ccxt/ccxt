package examples

import (
	"ccxt/go/ccxt"
	"fmt"
)

func FetchTrades() {
	// instantiate the exchange
	exchange := ccxt.NewBinance(nil)

	// Since fetchTrades is public you don't need to set apiKey and secret

	trades, err := exchange.FetchTrades("BTC/USDT", ccxt.WithFetchTradesLimit(50))

	if err != nil {
		fmt.Print(err) // request failed check the error
		return
	}

	fmt.Println(trades)
}
