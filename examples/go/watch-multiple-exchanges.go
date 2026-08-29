package examples

import (
	"fmt"
	"log"
	"sync"

	ccxtpro "github.com/ccxt/ccxt/go/v4/pro"
)

var wg sync.WaitGroup

func watchTrades(exchange ccxtpro.IExchange, symbol string) {
	defer wg.Done()
	for {
		trades, err := exchange.WatchTrades(symbol)
		if err != nil {
			log.Printf("Error watching trades for %s on %s: %v", symbol, exchange.GetId(), err)
			break
		}
		fmt.Println("Exchange", exchange.GetId(), "Symbol", symbol, "Trades:", len(trades))
	}
}

func WatchMultiple() {

	exchangesNames := []string{"binance", "bybit"}
	symbol := "BTC/USDT"

	for _, exchangeName := range exchangesNames {
		exchange := ccxtpro.CreateExchange(exchangeName, nil)
		if exchange == nil {
			log.Printf("Exchange %s not found", exchangeName)
			continue
		}
		wg.Add(1)
		go watchTrades(exchange, symbol)
	}

	wg.Wait()
}
