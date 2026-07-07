package examples

import (
	"fmt"
	"log"

	ccxt "github.com/ccxt/ccxt/go/v4"
	ccxtpro "github.com/ccxt/ccxt/go/v4/pro"
)

func PlaceOrderWs() {

	bybit := ccxtpro.NewBybit(nil)

	symbol := "BTC/USDT"

	bybit.LoadMarkets()

	order, err := bybit.CreateOrderWs(symbol, "limit", "buy", 0.001, ccxt.WithCreateOrderWsPrice(2000))
	if err != nil {
		log.Printf("Error creating order for %s on %s: %v", symbol, bybit.GetId(), err)
		return
	}
	fmt.Println("Order created:", order)
}