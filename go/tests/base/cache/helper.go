package cache

import (
	"encoding/json"

	ccxt "github.com/ccxt/ccxt/go/v4"
	"github.com/ccxt/tests/base"
)

func strOrNil(s string) any {
	if s == "" {
		return nil
	}
	return s
}

func Equals(a any, b any) bool {
	// return base.Equals(a, b)
	// should handle a being WsOrderBook or ArrayCache or any other variant
	// and it should compare map[string]any with the types above
	if a == nil || b == nil {
		return a == b
	}
	// if aCache, ok := a.(*ccxt.Base); ok {

	// }
	jsonA := []uint8{}
	var errA error

	switch a := a.(type) {
	case *ccxt.ArrayCache:
		jsonA, errA = json.Marshal(a.Data)
	case *ccxt.ArrayCacheBySymbolById:
		jsonA, errA = json.Marshal(a.Data)
	case *ccxt.ArrayCacheBySymbolBySide:
		jsonA, errA = json.Marshal(a.Data)
	case *ccxt.ArrayCacheByTimestamp:
		jsonA, errA = json.Marshal(a.Data)
	case *ccxt.WsOrderBook:
		ob := map[string]any{
			"bids":      a.Bids.GetData(),
			"asks":      a.Asks.GetData(),
			"nonce":     a.Nonce,
			"timestamp": a.Timestamp,
			"datetime":  a.Datetime,
			"symbol":    strOrNil(a.Symbol),
		}
		jsonA, errA = json.Marshal(ob)
	case *ccxt.IndexedOrderBook:
		ob := map[string]any{
			"bids":      a.Bids.GetData(),
			"asks":      a.Asks.GetData(),
			"datetime":  a.Datetime,
			"nonce":     a.Nonce,
			"timestamp": a.Timestamp,
			"symbol":    strOrNil(a.Symbol),
		}
		jsonA, errA = json.Marshal(ob)
	case *ccxt.CountedOrderBook:
		ob := map[string]any{
			"bids":      a.Bids.GetData(),
			"asks":      a.Asks.GetData(),
			"nonce":     a.Nonce,
			"timestamp": a.Timestamp,
			"datetime":  a.Datetime,
			"symbol":    strOrNil(a.Symbol),
		}
		jsonA, errA = json.Marshal(ob)
	default:
		jsonA, errA = json.Marshal(a)

	}
	jsonB, err2 := json.Marshal(b)

	if errA != nil || err2 != nil {
		return false
	}

	normalize := func(j []byte) []byte {
		var o any
		_ = json.Unmarshal(j, &o)
		b, _ := json.Marshal(o) // Marshal normalizes key order
		return b
	}

	strA := string(normalize(jsonA))
	strB := string(normalize(jsonB))
	res := strA == strB
	if !res {
		base.Print("[Error] Not equal: " + strA + " != " + strB)
	}
	return res

}

func Assert(a any) {
	base.Assert(a)
}

func Add(a any, b any) any {
	return base.Add(a, b)
}

func GetValue(collection any, key any) any {
	return base.GetValue(collection, key)
}

func IsLessThan(a any, b any) bool {
	return base.IsLessThan(a, b)
}

func ToString(value any) string {
	return base.ToString(value)
}

func IsEqual(a any, b any) bool {
	return base.IsEqual(a, b)
}

func Multiply(a any, b any) any {
	return base.Multiply(a, b)
}

func IsTrue(value any) bool {
	return base.IsTrue(value)
}

func GetArrayLength(value any) int {
	return base.GetArrayLength(value)
}

func NewOrderBook(ob any, params ...any) *ccxt.WsOrderBook {
	depth := ccxt.GetArg(params, 0, nil)
	return ccxt.NewWsOrderBook(ob, depth)
}

func NewIndexedOrderBook(ob any, params ...any) *ccxt.IndexedOrderBook {
	depth := ccxt.GetArg(params, 0, nil)
	return ccxt.NewIndexedOrderBook(ob, depth)
}

func NewCountedOrderBook(ob any, params ...any) *ccxt.CountedOrderBook {
	depth := ccxt.GetArg(params, 0, nil)
	return ccxt.NewCountedOrderBook(ob, depth)
}

func NewArrayCacheBySymbolById(params ...any) *ccxt.ArrayCacheBySymbolById {
	return ccxt.NewArrayCacheBySymbolById(params...)
}

func NewArrayCache(size any) *ccxt.ArrayCache {
	return ccxt.NewArrayCache(size)
}

func NewArrayCacheByTimestamp() *ccxt.ArrayCacheByTimestamp {
	return ccxt.NewArrayCacheByTimestamp(nil)
}

func NewArrayCacheBySymbolBySide() *ccxt.ArrayCacheBySymbolBySide {
	return ccxt.NewArrayCacheBySymbolBySide()
}
