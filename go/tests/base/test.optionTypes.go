package base

import (
	"strings"

	ccxt "github.com/ccxt/ccxt/go/v4"
)

// a present option of the wrong type panics with BadRequest in Go (JS/Python/PHP pass it through)
func TestOptionTypes() {
	exchange := ccxt.NewExchange().(*ccxt.Exchange)
	exchange.DerivedExchange = exchange
	exchange.InitParent(map[string]any{
		"id": "sampleexchange",
		"options": map[string]any{
			"fetchX": map[string]any{
				"wrongBool":   "yes",
				"wrongString": 5,
				"wrongInteger": "5",
				"fractionInteger": 1.5,
				"integralDouble": 2.0,
			},
		},
	}, map[string]any{}, exchange)
	assertOptionPanics(func() { exchange.HandleOptionBoolAndParams(map[string]any{}, "fetchX", "wrongBool", false) }, "fetchX() option wrongBool must be a boolean")
	assertOptionPanics(func() { exchange.HandleOptionStringAndParams(map[string]any{}, "fetchX", "wrongString", "x") }, "fetchX() option wrongString must be a string")
	assertOptionPanics(func() { exchange.HandleOptionIntegerAndParams(map[string]any{}, "fetchX", "wrongInteger", 1) }, "fetchX() option wrongInteger must be an integer")
	assertOptionPanics(func() { exchange.HandleOptionIntegerAndParams(map[string]any{}, "fetchX", "fractionInteger", 1) }, "fetchX() option fractionInteger must be an integer")
	integral, _ := exchange.HandleOptionIntegerAndParams(map[string]any{}, "fetchX", "integralDouble", 1)
	Assert(integral == 2, "an integral double option reads as int64")
	assertOptionPanics(func() { exchange.HandleMarginModeAndParams("fetchX", map[string]any{"marginMode": false}) }, "fetchX() option marginMode must be a string")
}

func assertOptionPanics(call func(), message string) {
	defer func() {
		e := recover()
		Assert(e != nil, "expected a BadRequest panic: "+message)
		err, ok := e.(error)
		Assert(ok && strings.Contains(err.Error(), "BadRequest") && strings.Contains(err.Error(), message), "unexpected panic for: "+message)
	}()
	call()
}
