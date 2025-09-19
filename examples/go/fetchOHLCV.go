package examples

import (
	"ccxt/go/ccxt"
	"fmt"
)

func FetchOHLCV() {
	// instantiate the exchange
	exchange := ccxt.NewBinance(nil)

	// Since fetchOHLCV is public you don't need to set apiKey and secret

	ohlcv, err := exchange.FetchOHLCV("BTC/USDT", ccxt.WithFetchOHLCVTimeframe("1m"), ccxt.WithFetchOHLCVLimit(10))

	if err != nil {
		fmt.Print(err) // request failed check the error
		return
	}

	fmt.Println(ohlcv)
}
