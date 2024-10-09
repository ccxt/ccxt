package main

import (
	"tests/base"
)

func main() {
	// fmt.Println("Will run base tests!")
	// base.BaseTestsInit()
	tests := base.NewTestMainClass()
	<-tests.Init("binance", nil, nil)
	// NewTestMainClass()
	// fmt.Println("Base tests passed!")
}
