package main

import (
	"fmt"

	"github.com/ccxt/tests/base"
	cache "github.com/ccxt/tests/base/cache"
)

func main() {
	RUN_BASE_TESTS := base.GetCliArgValue("--baseTests")
	WS_TESTS := base.GetCliArgValue("--ws")
	if RUN_BASE_TESTS {
		if WS_TESTS {
			cache.TestWsCache()
			cache.TestWsOrderBook()
			fmt.Println("Base WS tests passed!")
		} else {
			res := <-base.BaseTestsInit()
			base.PanicOnError(res)
			fmt.Println("Base REST tests passed!")
		}

		return
	}
	tests := base.NewTestMainClass()

	argvExchange := base.GetCliPositionalArg(0)
	argvSymbol := base.GetCliPositionalArg(1)
	argvMethod := base.GetCliPositionalArg(2)

	res := <-tests.Init(argvExchange, argvSymbol, argvMethod)
	base.Print("Got res: " + base.ToString(res))
	base.PanicOnError(res)
}
