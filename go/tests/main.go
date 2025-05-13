package main

import (
	"fmt"

	"github.com/ccxt/tests/base"
)

func main() {
	RUN_BASE_TETS := base.GetCliArgValue("--baseTests")
	if RUN_BASE_TETS {
		base.BaseTestsInit()
		fmt.Println("Base REST tests passed!")
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
