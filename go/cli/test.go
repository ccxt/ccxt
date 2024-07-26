package main

import (
	"ccxt"
	"fmt"
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
	binance.ApiKey = "z2aSOxQ9qPS0RIxS17ns2zN7UjMVoPF7jvTvpUJmnTlTZoj25GcnHdyPQXeQDJk9"
	binance.Secret = "X1p9TkTnfbPTmYsbO3eJGI5I338XMmiFCF9AE3U5NxbS5dVZE6qZy8RqWXg1dcGF"
	order := binance.CreateOrder("BTC/USDT", "limit", "buy", 0.01, 10000)
	fmt.Println(order)
	trades := binance.FetchTrades("BTC/USDT")
	fmt.Println(trades)
	fmt.Println(res)
	fmt.Println(IsArray)
	fmt.Println(binance.Id)
}
