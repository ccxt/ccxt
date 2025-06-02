package main

import (
	"fmt"

	ccxt "github.com/ccxt/ccxt/go/v4"
)

func main() {
	// RUN_BASE_TESTS := base.GetCliArgValue("--baseTests")
	// if RUN_BASE_TESTS {
	// 	base.BaseTestsInit()
	// 	fmt.Println("Base REST tests passed!")
	// 	return
	// }
	// tests := base.NewTestMainClass()

	// argvExchange := base.GetCliPositionalArg(0)
	// argvSymbol := base.GetCliPositionalArg(1)
	// argvMethod := base.GetCliPositionalArg(2)

	// res := <-tests.Init(argvExchange, argvSymbol, argvMethod)
	// base.Print("Got res: " + base.ToString(res))
	// base.PanicOnError(res)

	bybit := ccxt.NewBybit(nil)

	before := bybit.Milliseconds()

	<-bybit.LoadMarkets()

	after := bybit.Milliseconds()

	duration := after - before

	fmt.Println("Load Markets took" + ccxt.ToString(duration))

	<-bybit.LoadMarkets()

	after2 := bybit.Milliseconds()

	duration2 := after2 - after

	fmt.Println("LoadMarkets cached: " + ccxt.ToString(duration2))

	<-bybit.LoadMarkets(true)

	after3 := bybit.Milliseconds()

	duration3 := after3 - after2

	fmt.Println("LoadingMarkets refresh took: " + ccxt.ToString(duration3))

}
