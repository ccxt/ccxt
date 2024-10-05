package main

import (
	"fmt"
	"tests/base"
)

func main() {
	fmt.Println("Will run base tests!")
	// base.BaseTestsInit()
	tests := base.NewTestMainClass()
	<-tests.Init("binance", "BTC/USDT", nil)
	// NewTestMainClass()
	fmt.Println("Base tests passed!")
}
