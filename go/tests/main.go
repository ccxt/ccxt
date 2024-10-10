package main

import (
	"tests/base"
)

func main() {
	// fmt.Println("Will run base tests!")
	// base.BaseTestsInit()
	tests := base.NewTestMainClass()
	res := <-tests.Init("binance", nil, nil)
	base.PanicOnError(res)
	// NewTestMainClass()
	// fmt.Println("Base tests passed!")
}
