package ccxt

import (
	"sort"
)

type PriceLevel struct {
	Price  float64
	Amount float64
}

type OrderBookSide struct {
	Levels []PriceLevel
	IsBid  bool
}

// ------------ Convenience wrappers matching TS subclasses ------------

// Asks represents the ask-side of the order book (sorted ascending).
type Asks struct{ *OrderBookSide }

// Bids represents the bid-side of the order book (sorted descending).
type Bids struct{ *OrderBookSide }

// CountedAsks/Bids & IndexedAsks/Bids are currently thin aliases around
// OrderBookSide since counting/indexing logic is handled in StoreArray.
// They are defined to satisfy generated references from the transpiler.
type CountedAsks struct{ *OrderBookSide }
type CountedBids struct{ *OrderBookSide }
type IndexedAsks struct{ *OrderBookSide }
type IndexedBids struct{ *OrderBookSide }

// NewAsks returns a new ask side, pre-loading any provided deltas.
func NewAsks(deltas interface{}, _ interface{}) *OrderBookSide {
	ob := NewOrderBookSide(false)
	for _, d := range deltas.([]interface{}) {
		ob.StoreArray(d)
	}
	return ob
}

// NewBids returns a new bid side, pre-loading any provided deltas.
func NewBids(deltas interface{}, _ interface{}) *OrderBookSide {
	ob := NewOrderBookSide(true)
	for _, d := range deltas.([]interface{}) {
		ob.StoreArray(d)
	}
	return ob
}

// NewCountedAsks mirrors NewAsks but kept for parity with TS code.
func NewCountedAsks(deltas interface{}, depth interface{}) *OrderBookSide {
	return NewAsks(deltas, depth)
}

// NewCountedBids mirrors NewBids but kept for parity with TS code.
func NewCountedBids(deltas interface{}, depth interface{}) *OrderBookSide {
	return NewBids(deltas, depth)
}

// NewIndexedAsks mirrors NewAsks; per-price-level indexing is not required in Go.
func NewIndexedAsks(deltas interface{}, depth interface{}) *OrderBookSide {
	return NewAsks(deltas, depth)
}

// NewIndexedBids mirrors NewBids.
func NewIndexedBids(deltas interface{}, depth interface{}) *OrderBookSide {
	return NewBids(deltas, depth)
}

func NewOrderBookSide(isBid bool) *OrderBookSide {
	return &OrderBookSide{IsBid: isBid}
}

func (o *OrderBookSide) Store(price interface{}, amount interface{}) {
	p := ToFloat64(price)
	a := ToFloat64(amount)
	idx := -1
	for i, lvl := range o.Levels {
		if lvl.Price == p {
			idx = i
			break
		}
	}
	if a == 0 {
		if idx != -1 {
			o.Levels = append(o.Levels[:idx], o.Levels[idx+1:]...)
		}
		return
	}
	if idx != -1 {
		o.Levels[idx].Amount = a
	} else {
		o.Levels = append(o.Levels, PriceLevel{Price: p, Amount: a})
	}
	o.sortLevels()
}

// func ToFloat64(v interface{}) float64 {
// 	switch t := v.(type) {
// 	case float64:
// 		return t
// 	case float32:
// 		return float64(t)
// 	case int:
// 		return float64(t)
// 	case int64:
// 		return float64(t)
// 	case uint64:
// 		return float64(t)
// 	case string:
// 		f, _ := strconv.ParseFloat(t, 64)
// 		return f
// 	default:
// 		return 0
// 	}
// }

func (o *OrderBookSide) StoreArray(arr interface{}) {
	slice, ok := arr.([]interface{})
	if !ok || len(slice) < 2 {
		return
	}
	price := slice[0]
	size := slice[1]
	if len(slice) >= 3 {
		third := slice[2]
		if cnt := ToFloat64(third); cnt == 0 && ToFloat64(size) != 0 {
			o.Store(price, 0)
			return
		}
	}
	o.Store(price, size)
}

func (o *OrderBookSide) sortLevels() {
	if o.IsBid {
		sort.Slice(o.Levels, func(i, j int) bool { return o.Levels[i].Price > o.Levels[j].Price })
	} else {
		sort.Slice(o.Levels, func(i, j int) bool { return o.Levels[i].Price < o.Levels[j].Price })
	}
}

func (o *OrderBookSide) Limit(depth ...interface{}) []PriceLevel {
	if len(depth) == 0 {
		return o.Levels
	}
	d := depth[0].(int)
	if d >= len(o.Levels) {
		return o.Levels
	}
	return o.Levels[:d]
}
