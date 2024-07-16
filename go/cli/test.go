package main

import (
	"ccxt"
	"fmt"
)

// import ccxt module here
func main() {
	fmt.Println("Hello, World!")
	IsArray := ccxt.IsArray(4)
	binance := ccxt.Binance{}
	binance.Init(map[string]interface{}{})
	fmt.Println(IsArray)
	fmt.Println(binance.Id)
}
