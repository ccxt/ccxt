package base

import ccxt "github.com/ccxt/ccxt/go/v4"

func TestLanguageSpecificAsync() <-chan ccxt.AsyncResult[any] {
	TestFutures()
	TestStructs()
	TestOptionTypes()

	ch := make(chan ccxt.AsyncResult[any])
	close(ch)
	return ch
}
