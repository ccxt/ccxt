package main

import (
	"fmt"
	"tests/base"
)

func main() {
	fmt.Println("Will run base tests!")
	base.BaseTestsInit()
	// NewTestMainClass()
	fmt.Println("Base tests passed!")
}
