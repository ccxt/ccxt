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
	res := binance.FetchMarkets()
	fmt.Println(res)
	fmt.Println(IsArray)
	fmt.Println(binance.Id)
}
