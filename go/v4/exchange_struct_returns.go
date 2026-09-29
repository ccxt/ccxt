package ccxt

import "reflect"

// Boundaries of the struct-typed row builders (build/go-struct-returns.ts): the generated
// ParseTicker/SafeTicker return a Ticker, every untyped caller boxes it back with TickerToMap.

// TickerFromMap builds a Ticker from a unified ticker map; keys the struct does not declare
// (and a non-dict `info`) are kept aside so TickerToMap gives back the same map.
func TickerFromMap(data any) Ticker {
	m, ok := data.(map[string]any)
	if !ok {
		return Ticker{}
	}
	t := NewTicker(m)
	// undeclared keys ride in extra, so Info stays the raw info (NewTicker merges them in)
	t.Info = GetInfo(m)
	t.extra = structExtraKeys(m, tickerKeys, nil)
	return t
}

var tickerKeys = map[string]bool{
	"symbol": true, "timestamp": true, "datetime": true, "high": true, "low": true, "bid": true,
	"bidVolume": true, "ask": true, "askVolume": true, "vwap": true, "open": true, "close": true,
	"last": true, "previousClose": true, "change": true, "percentage": true, "average": true,
	"baseVolume": true, "quoteVolume": true, "indexPrice": true, "markPrice": true,
}

// TickerToMap is the inverse of TickerFromMap (the shape every untyped caller expects).
func TickerToMap(t Ticker) map[string]any {
	return StructToMap(t)
}

func (t Ticker) structExtra() map[string]any { return t.extra }

type structExtraCarrier interface{ structExtra() map[string]any }

// structAbsent marks a declared key the source map did not have, so the round trip drops it
type structAbsent struct{}

func structExtraKeys(m map[string]any, known map[string]bool, valueKeys []string) map[string]any {
	extra := map[string]any{}
	for k, v := range m {
		if known[k] {
			continue
		}
		if k == "info" {
			if _, isDict := v.(map[string]any); isDict || v == nil {
				continue
			}
		}
		extra[k] = v
	}
	for k := range known {
		if _, has := m[k]; !has {
			extra[k] = structAbsent{}
		}
	}
	if _, has := m["info"]; !has {
		extra["info"] = structAbsent{}
	}
	for _, k := range valueKeys {
		if _, has := m[k]; !has {
			extra[k] = structAbsent{}
		}
	}
	return extra
}

// StructToMap turns a unified struct into its ccxt map: exported fields under their
// lowerCamel key (pointers dereferenced, nil kept as nil), plus the unexported `extra` keys.
// Generic (reflect) so the tests can normalise any struct before a map comparison.
func StructToMap(s any) map[string]any {
	v := reflect.ValueOf(s)
	if v.Kind() == reflect.Ptr {
		if v.IsNil() {
			return nil
		}
		v = v.Elem()
	}
	if v.Kind() != reflect.Struct {
		if m, ok := s.(map[string]any); ok {
			return m
		}
		return nil
	}
	t := v.Type()
	m := make(map[string]any, t.NumField())
	for i := 0; i < t.NumField(); i++ {
		f := t.Field(i)
		if !f.IsExported() {
			continue
		}
		fv := v.Field(i)
		key := lowerFirst(f.Name)
		switch {
		case fv.Kind() == reflect.Ptr && fv.IsNil():
			m[key] = nil
		case fv.Kind() == reflect.Ptr:
			m[key] = fv.Elem().Interface()
		case fv.Kind() == reflect.Map && fv.IsNil():
			m[key] = nil
		default:
			m[key] = fv.Interface()
		}
	}
	if c, ok := v.Interface().(structExtraCarrier); ok {
		for k, x := range c.structExtra() {
			if _, absent := x.(structAbsent); absent {
				delete(m, k)
			} else {
				m[k] = x
			}
		}
	}
	return m
}

func lowerFirst(s string) string {
	if s == "" {
		return s
	}
	b := []byte(s)
	if b[0] >= 'A' && b[0] <= 'Z' {
		b[0] += 'a' - 'A'
	}
	return string(b)
}

// TradeFromMap builds a Trade from a unified trade map; `fee`/`fees` and other undeclared keys
// ride in extra so TradeToMap gives back the same map (Fee drops non-dict and unknown fee keys).
func TradeFromMap(data any) Trade {
	m, ok := data.(map[string]any)
	if !ok {
		return Trade{}
	}
	t := NewTrade(m)
	t.Info = GetInfo(m)
	t.extra = structExtraKeys(m, tradeKeys, tradeValueKeys)
	return t
}

var tradeKeys = map[string]bool{
	"amount": true, "price": true, "cost": true, "id": true, "order": true, "timestamp": true,
	"datetime": true, "symbol": true, "type": true, "side": true, "takerOrMaker": true,
}

// TradeToMap is the inverse of TradeFromMap.
func TradeToMap(t Trade) map[string]any {
	return StructToMap(t)
}

// value fields rebuilt lossily (Fee): the map's own value rides in extra instead
var tradeValueKeys = []string{"fee"}

func (t Trade) structExtra() map[string]any { return t.extra }

// OHLCVFromList builds an OHLCV from a parsed [ts, o, h, l, c, v] row (nil elements read as 0);
// the row itself is kept so OHLCVToList returns it unchanged.
func OHLCVFromList(data any) OHLCV {
	o := OHLCV{row: data}
	if row, ok := data.([]any); ok {
		if ts := SafeInt64Typed(row, 0); ts != nil {
			o.Timestamp = *ts
		}
		for i, dst := range []*float64{&o.Open, &o.High, &o.Low, &o.Close, &o.Volume} {
			if f := SafeFloatTyped(row, i+1); f != nil {
				*dst = *f
			}
		}
	}
	return o
}

// OHLCVToList is the inverse of OHLCVFromList.
func OHLCVToList(o OHLCV) any {
	if o.row != nil {
		return o.row
	}
	return []any{o.Timestamp, o.Open, o.High, o.Low, o.Close, o.Volume}
}

// OrderFromMap builds an Order from a unified order map. NewOrder asserts `fee` is a dict and
// `trades` a list of dicts, so it reads a copy holding only those shapes; the map's own
// fee/trades ride in extra so OrderToMap gives back the same map.
func OrderFromMap(data any) Order {
	m, ok := data.(map[string]any)
	if !ok {
		return Order{}
	}
	view := make(map[string]any, len(m))
	for k, v := range m {
		view[k] = v
	}
	if _, isDict := view["fee"].(map[string]any); !isDict {
		delete(view, "fee")
	}
	delete(view, "trades")
	o := NewOrder(view)
	if list, isList := m["trades"].([]any); isList {
		for _, t := range list {
			if _, isDict := t.(map[string]any); isDict {
				o.Trades = append(o.Trades, TradeFromMap(t))
			}
		}
	}
	o.Info = GetInfo(m)
	o.extra = structExtraKeys(m, orderKeys, orderValueKeys)
	return o
}

var orderKeys = map[string]bool{
	"id": true, "clientOrderId": true, "timestamp": true, "datetime": true, "lastTradeTimestamp": true,
	"symbol": true, "type": true, "side": true, "price": true, "cost": true, "average": true,
	"amount": true, "filled": true, "remaining": true, "status": true, "reduceOnly": true,
	"postOnly": true, "triggerPrice": true, "stopLossPrice": true, "takeProfitPrice": true,
	"lastUpdateTimestamp": true, "timeInForce": true, "stopPrice": true,
}

var orderValueKeys = []string{"fee", "trades"}

// OrderToMap is the inverse of OrderFromMap.
func OrderToMap(o Order) map[string]any {
	return StructToMap(o)
}

func (o Order) structExtra() map[string]any { return o.extra }
