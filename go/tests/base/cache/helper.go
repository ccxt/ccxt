package cache

import (
	ccxt "github.com/ccxt/ccxt/go/v4"
	"github.com/ccxt/tests/base"
)

func Equals(a interface{}, b interface{}) bool {
	return base.Equals(a, b)
}

func Assert(a interface{}) {
	base.Assert(a)
}

func GetValue(collection interface{}, key interface{}) interface{} {
	return base.GetValue(collection, key)
}

func IsLessThan(a interface{}, b interface{}) bool {
	return base.IsLessThan(a, b)
}

func ToString(value interface{}) string {
	return base.ToString(value)
}

func IsEqual(a interface{}, b interface{}) bool {
	return base.IsEqual(a, b)
}

func Multiply(a interface{}, b interface{}) interface{} {
	return base.Multiply(a, b)
}

func IsTrue(value interface{}) bool {
	return base.IsTrue(value)
}

func GetArrayLength(value interface{}) int {
	return base.GetArrayLength(value)
}

func NewOrderBook(ob interface{}) ccxt.OrderBook {
	return ccxt.NewOrderBook(ob)
}

func NewIndexedOrderBook(ob interface{}) ccxt.IndexedOrderBook {
	return ccxt.NewIndexedOrderBook(ob)
}
