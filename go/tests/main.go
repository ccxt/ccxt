package main

import (
	"fmt"
	"tests/base"
)

func main() {
	RUN_BASE_TETS := base.GetCliArgValue("--baseTests")

	if RUN_BASE_TETS {
		base.BaseTestsInit()
		fmt.Println("Base tests passed!")
		return
	}
	tests := base.NewTestMainClass()

	argvExchange := base.GetCliPositionalArg(0)
	argvSymbol := base.GetCliPositionalArg(1)
	argvMethod := base.GetCliPositionalArg(2)

	<-tests.Init(argvExchange, argvSymbol, argvMethod)

}
