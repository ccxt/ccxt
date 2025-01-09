package examples

import (
	"ccxt/go/ccxt"
	"fmt"
)

func spotPerpMarkets() {
	exchange := ccxt.NewBybit(nil)
	exchange.ApiKey = ""
	exchange.Secret = ""

	<-exchange.LoadMarkets(true)

	allMarkets := exchange.GetMarketsList()

	spotMarkets := []string{}
	swapMarkets := []string{}

	for _, elem := range allMarkets {
		if *elem.Spot {
			spotMarkets = append(spotMarkets, *elem.Symbol)
		} else if *elem.Swap {
			swapMarkets = append(swapMarkets, *elem.Symbol)
		}
	}

	fmt.Println(spotMarkets)
	fmt.Println(swapMarkets)
}
