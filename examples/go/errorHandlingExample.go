package examples

import (
	"ccxt/go/ccxt"
	"fmt"
)

func CreateOrderWithErrorHandling() {
	// instantiate the exchange
	exchange := ccxt.NewBinance(nil)

	// set apiKey and secret
	exchange.ApiKey = "my-api-key"
	exchange.Secret = "my secret"

	// if in sandbox mode run this line
	// exchange.SetSandboxMode(true)

	// We will create a limit order that is also postOnly

	orderParams := map[string]interface{}{
		"postOnly":      true,
		"clientOrderId": "my-client-order-id",
	}

	order, err := exchange.CreateOrder("BTC/USDT", "limit", "buy", 0.001, ccxt.WithCreateOrderPrice(10000), ccxt.WithCreateOrderParams(orderParams))

	if err != nil {
		if ccxtError, ok := err.(*ccxt.Error); ok {
			if ccxtError.Type == ccxt.InvalidOrderErrType {
				fmt.Println("Invalid order")
				fmt.Println(ccxtError.Message)
				fmt.Println(ccxtError.Stack)
			} else {
				fmt.Println("Some other error" + ccxtError.Type)
			}
		}
	}

	fmt.Println(order)
}
