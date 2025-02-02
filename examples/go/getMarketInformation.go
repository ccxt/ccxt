package examples

import (
	"ccxt/go/ccxt"
)

func GetMarket() {
	// instantiate the exchange
	exchange := ccxt.NewBinance(nil)

	<-exchange.LoadMarkets() // loading markets first

	symbol := "BTC/USDT"

	market := exchange.GetMarket(symbol)

	if *market.Spot {
		println("Spot market")
	} else if *market.Swap {
		println("Swap market")
	}

	swapSymbol := "BTC/USDT:USDT"

	swapMarket := exchange.GetMarket(swapSymbol)

	println("Contract Size: ", *swapMarket.ContractSize)
}
