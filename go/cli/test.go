package main

import (
	"ccxt"
	"fmt"
	"os"
)

func main() {
	fmt.Println("Hello, World!")
	IsArray := ccxt.IsArray(4)
	binance := ccxt.Binance{}
	binance.Init(map[string]interface{}{})
	t := ccxt.IsEqual(nil, nil)
	tr := ccxt.IsTrue(t)
	fmt.Println(t, tr)
	res := binance.LoadMarkets()
	binance.ApiKey = os.Getenv("BINANCE_APIKEY")
	binance.Secret = os.Getenv("BINANCE_SECRET")
	order := binance.CreateOrder("BTC/USDT", "limit", "buy", 0.01, 10000)
	fmt.Println(order)
	trades := binance.FetchTrades("BTC/USDT")
	fmt.Println(trades)
	fmt.Println(res)
	fmt.Println(IsArray)
	fmt.Println(binance.Id)
}
