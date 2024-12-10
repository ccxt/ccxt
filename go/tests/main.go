package main

import "fmt"

// "ccxt/go/ccxt"

// func main() {
// 	RUN_BASE_TETS := base.GetCliArgValue("--baseTests")

// 	if RUN_BASE_TETS {
// 		base.BaseTestsInit()
// 		fmt.Println("Base tests passed!")
// 		return
// 	}
// 	tests := base.NewTestMainClass()

// 	argvExchange := base.GetCliPositionalArg(0)
// 	argvSymbol := base.GetCliPositionalArg(1)
// 	argvMethod := base.GetCliPositionalArg(2)

// 	res := <-tests.Init(argvExchange, argvSymbol, argvMethod)
// 	if res != nil {
// 		resStr := base.ToString(res)
// 		if strings.HasPrefix(resStr, "panic:") {
// 			panic(resStr)
// 		}
// 	}
// }

func main() {

	// exchange := ccxt.NewBinance(map[string]interface{}{})
	// // exchange.HttpProxy = "http://23434"
	// // exchange.SocksProxy = "socks5://23434"
	// // exchange.HttpsProxy = "htpps://23434"
	// <-exchange.LoadMarkets()
	// exchange.EnableRateLimit = false
	// symbol := "BTC/USDT"
	// for i := 0; i < 5; i++ {
	// 	before := exchange.Milliseconds()
	// 	exchange.FetchTicker(symbol)
	// 	after := exchange.Milliseconds()
	// 	fmt.Println(after - before)
	// }
	// // isInvalidProxy := errors.Is(err, ccxt.InvalidProxySettings())
	// // fmt.Println(isInvalidProxy)
	// fmt.Println(trades)
	// fmt.Println(err)
	fmt.Println("Debug build go")
}
