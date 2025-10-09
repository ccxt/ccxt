package examples

import (
	"fmt"
	"log"

	ccxtpro "github.com/ccxt/ccxt/go/v4/pro"
)

func WatchOHLCV() {

	binance := ccxtpro.NewBinance(nil)

	symbol := "BTC/USDT"

	for {
		ohlcv, err := binance.WatchOHLCV(symbol, ccxtpro.WithWatchOHLCVTimeframe("1h"))
		if err != nil {
			log.Printf("Error watching OHLCV for %s on %s: %v", symbol, binance.GetId(), err)
			break
		}
		fmt.Println("Symbol", symbol, "OHLCV:", ohlcv)
	}
}
