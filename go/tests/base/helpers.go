package tests

import (
	"ccxt"
	"fmt"
)

const (
	// TRUNCATE           = 0
	ROUND      = 1
	ROUND_UP   = 2
	ROUND_DOWN = 3
	// DECIMAL_PLACES     = 2
	// SIGNIFICANT_DIGITS = 3
	// TICK_SIZE          = 4
	// NO_PADDING         = 5
	// PAD_WITH_ZERO      = 6
)

var DECIMAL_PLACES int = 2
var SIGNIFICANT_DIGITS int = 3
var TICK_SIZE int = 4
var TRUNCATE int = 0
var NO_PADDING = 5
var PAD_WITH_ZERO int = 6

func Assert(condition2 interface{}, message2 ...interface{}) {
	condition := true

	// Check if the condition is nil or not of type bool
	if condition2 == nil {
		condition = false
	} else {
		// Type assertion for bool
		if c, ok := condition2.(bool); ok {
			condition = c
		} else {
			condition = false
		}
	}

	// Convert the message to string
	message := ""
	if len(message2) > 0 {
		message = fmt.Sprint(message2...)
	}

	// If condition is false, throw an error with the message
	if !condition {
		errorMessage := "Assertion failed"
		if message != "" {
			errorMessage += ": " + message
		}
		panic(errorMessage)
	}
}

func IsEqual(a, b interface{}) bool {
	return ccxt.IsEqual(a, b)
}

func GetValue(obj interface{}, key interface{}) interface{} {
	return ccxt.GetValue(obj, key)
}

func InOp(a, b interface{}) bool {
	return ccxt.InOp(a, b)
}

func IsTrue(a interface{}) bool {
	return ccxt.IsTrue(a)
}

func OpNeg(a interface{}) interface{} {
	return ccxt.OpNeg(a)
}
