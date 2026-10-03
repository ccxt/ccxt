package ccxt

import "reflect"

// Boundaries of the struct-typed row builders (build/go-struct-returns.ts): the generated
// ParseTicker/SafeTicker/... return a struct, every untyped caller boxes it back with <T>ToMap.
// The structs carry exactly the keys declared in ts/src/base/types.ts; Info is the raw response.

// TickerFromMap builds a Ticker from a unified ticker map.
func TickerFromMap(data any) Ticker {
	m, ok := data.(map[string]any)
	if !ok {
		return Ticker{}
	}
	return NewTicker(m)
}

// TickerToMap is the map shape every untyped caller expects.
func TickerToMap(t Ticker) map[string]any {
	return StructToMap(t)
}

// TradeFromMap builds a Trade from a unified trade map (a non-dict `fee` reads as absent).
func TradeFromMap(data any) Trade {
	m, ok := data.(map[string]any)
	if !ok {
		return Trade{}
	}
	return NewTrade(withDictFee(m))
}

// TradeToMap is the map shape every untyped caller expects.
func TradeToMap(t Trade) map[string]any {
	return StructToMap(t)
}

// OrderFromMap builds an Order from a unified order map. NewOrder asserts `fee` is a dict and
// `trades` a list of maps, so a non-dict fee reads as absent and trades are built here.
func OrderFromMap(data any) Order {
	m, ok := data.(map[string]any)
	if !ok {
		return Order{}
	}
	view := copyMap(withDictFee(m))
	delete(view, "trades")
	o := NewOrder(view)
	if list, isList := m["trades"].([]any); isList {
		o.Trades = make([]Trade, 0, len(list))
		for _, t := range list {
			if _, isDict := t.(map[string]any); isDict {
				o.Trades = append(o.Trades, TradeFromMap(t))
			}
		}
	}
	return o
}

// OrderToMap is the map shape every untyped caller expects.
func OrderToMap(o Order) map[string]any {
	return StructToMap(o)
}

func copyMap(m map[string]any) map[string]any {
	out := make(map[string]any, len(m))
	for k, v := range m {
		out[k] = v
	}
	return out
}

func withDictFee(m map[string]any) map[string]any {
	if _, isDict := m["fee"].(map[string]any); isDict || m["fee"] == nil {
		return m
	}
	view := copyMap(m)
	delete(view, "fee")
	return view
}

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

// StructToMap turns a unified struct into its ccxt map: exported fields under their lowerCamel
// key, pointers dereferenced, nested structs (and slices of them) as maps, and a nested struct
// with every field nil (an absent Fee) as nil.
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
		if f := t.Field(i); f.IsExported() {
			m[lowerFirst(f.Name)] = structValueToAny(v.Field(i))
		}
	}
	return m
}

func structValueToAny(fv reflect.Value) any {
	switch fv.Kind() {
	case reflect.Ptr, reflect.Interface:
		if fv.IsNil() {
			return nil
		}
		return structValueToAny(fv.Elem())
	case reflect.Map:
		if fv.IsNil() {
			return nil
		}
	case reflect.Struct:
		if structIsVacant(fv) {
			return nil
		}
		return StructToMap(fv.Interface())
	case reflect.Slice:
		if fv.IsNil() {
			return nil
		}
		if fv.Type().Elem().Kind() == reflect.Struct {
			out := make([]any, fv.Len())
			for i := 0; i < fv.Len(); i++ {
				out[i] = StructToMap(fv.Index(i).Interface())
			}
			return out
		}
	}
	return fv.Interface()
}

func structIsVacant(v reflect.Value) bool {
	for i := 0; i < v.NumField(); i++ {
		switch f := v.Field(i); f.Kind() {
		case reflect.Ptr, reflect.Interface, reflect.Map, reflect.Slice:
			if !f.IsNil() {
				return false
			}
		default:
			return false
		}
	}
	return true
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
