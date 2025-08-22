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

func Add(a interface{}, b interface{}) interface{} {
	return base.Add(a, b)
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

func NewOrderBook(ob interface{}, params ...interface{}) *ccxt.WsOrderBook {
	depth := ccxt.GetArg(params, 0, nil)
	return ccxt.NewWsOrderBook(ob, depth)
}

func NewIndexedOrderBook(ob interface{}, params ...interface{}) *ccxt.IndexedOrderBook {
	depth := ccxt.GetArg(params, 0, nil)
	return ccxt.NewIndexedOrderBook(ob, depth)
}

func NewCountedOrderBook(ob interface{}, params ...interface{}) *ccxt.CountedOrderBook {
	depth := ccxt.GetArg(params, 0, nil)
	return ccxt.NewCountedOrderBook(ob, depth)
}

func NewArrayCacheBySymbolById(params ...interface{}) *ccxt.ArrayCacheBySymbolById {
	return ccxt.NewArrayCacheBySymbolById(params...)
}

func NewArrayCache(size interface{}) *ccxt.ArrayCache {
	return ccxt.NewArrayCache(size)
}

func NewArrayCacheByTimestamp() *ccxt.ArrayCacheByTimestamp {
	return ccxt.NewArrayCacheByTimestamp(nil)
}

func NewArrayCacheBySymbolBySide() *ccxt.ArrayCacheBySymbolBySide {
	return ccxt.NewArrayCacheBySymbolBySide()
}
