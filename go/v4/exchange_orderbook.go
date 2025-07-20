package ccxt

import (
	"fmt"
	"math"
	"strings"
)

// type CustomOrderBookProp interface {
// 	cache []any
// }

type OrderBookInterface interface {
    Limit() interface{}
    Update(snapshot interface{}) interface{}
    Reset(snapshot interface{}) interface{}
	GetCache() *interface{}
	SetCache(cache interface{})
	GetNonce() interface{}
	GetValue(key string, defaultValue interface{}) interface{}
}

type WsOrderBook struct {
	Cache     interface{}
	Asks      IOrderBookSide
	Bids      IOrderBookSide
	Timestamp int64
	Datetime  interface{}
	Nonce     interface{}
	Symbol    string
}

func (this *WsOrderBook) GetValue(key string, defaultValue interface{}) interface{} {
	switch key {
	case "Nonce":
		return this.Nonce
	case "Cache":
		return this.Cache
	case "Asks":
		return this.Asks
	case "Bids":
		return this.Bids
	case "Timestamp":
		return this.Timestamp
	case "Datetime":
		return this.Datetime
	case "Symbol":
		return this.Symbol
	default:
		return defaultValue
	}
}

func NewWsOrderBook(snapshot interface{}, depth interface{}) *WsOrderBook {
	if depth == nil {
		depth = math.MaxInt32
	}
	if snapshot == nil {
		snapshot = make(map[string]interface{})
	}
	// Sanitize snapshot to ensure asks and bids are always [][]float64
	asks, bids := getAsksBids(snapshot)
	snapshotMap := snapshot.(map[string]interface{})
	timestamp := SafeInt64(snapshotMap, "timestamp", 0).(int64)

	return &WsOrderBook{
		Cache: SafeValue(snapshotMap, "cache", map[string]interface{}{}),
		Asks: NewAsks(asks, depth),
		Bids: NewBids(bids, depth),
		Timestamp: timestamp,
		Datetime: Iso8601(timestamp),
		Nonce: SafeInteger(snapshotMap, "nonce", nil),
		Symbol: SafeString(snapshotMap, "symbol", "").(string),
	}
}

func (this *WsOrderBook) Limit() interface{} {
    // Ensure child sides are depth-limited in-place and return the same pointer
	this.Asks.Limit()
	this.Bids.Limit()
    return this
}

func (this *WsOrderBook) Update(snapshot interface{}) interface{} {
	// Convert JavaScript logic to Go
	nonce := this.Nonce
	if nonce == nil {
		nonce = 0
	}
	if snapshotNonce, ok := snapshot.(map[string]interface{})["nonce"]; ok {
		if nonce != 0 && snapshotNonce.(int64) <= nonce.(int64) {
			return this
		}
		this.Nonce = snapshotNonce.(int64)
	}
	
	if timestamp, ok := snapshot.(map[string]interface{})["timestamp"]; ok {
		this.Timestamp = timestamp.(int64)
		this.Datetime = Iso8601(timestamp.(int64))
	}
	
	return this.Reset(snapshot)
}

func (this *WsOrderBook) Reset(snapshot interface{}) interface{} {
	if snapshot == nil {
		snapshot = make(map[string]interface{})
	}
	bids, asks := getAsksBids(snapshot)
	snapshotMap := snapshot.(map[string]interface{})
	
	for i := range *this.Asks.GetIndex() {
		(*this.Asks.GetIndex())[i] = math.MaxFloat64
	}
	this.Asks.SetLen(0)
	for _, ask := range asks {
		this.Asks.StoreArray(ask)
	}
	
	for i := range *this.Bids.GetIndex() {
		(*this.Bids.GetIndex())[i] = math.MaxFloat64
	}
	this.Bids.SetLen(0)
	for _, bid := range bids {
		this.Bids.StoreArray(bid)
	}
	this.Nonce = SafeInteger(snapshotMap, "nonce", nil)
	this.Timestamp = SafeInt64(snapshotMap, "timestamp", 0).(int64)
	this.Datetime = Iso8601(this.Timestamp)
	this.Symbol = SafeString(snapshotMap, "symbol", "").(string)
	
	return this
}

// Might need if IndexedOrder and CountedOrderBook access the cache
func (this *WsOrderBook) GetCache() *interface{} {
	return &this.Cache
}

func (this *WsOrderBook) SetCache(cache interface{}) {
	this.Cache = cache
}

// String returns a formatted string representation of the WsOrderBook struct
func (this *WsOrderBook) String() string {
	var result strings.Builder
	result.WriteString("WsOrderBook{")
	
	if this.Symbol != "" {
		result.WriteString(fmt.Sprintf(" Symbol:%s", this.Symbol))
	}
	
	if this.Timestamp != 0 {
		result.WriteString(fmt.Sprintf(" Timestamp:%d", this.Timestamp))
	}
	
	if this.Datetime != nil {
		result.WriteString(fmt.Sprintf(" Datetime:%v", this.Datetime))
	}
	
	if this.Nonce != nil {
		result.WriteString(fmt.Sprintf(" Nonce:%d", this.Nonce))
	}
	
	result.WriteString(fmt.Sprintf(" Cache:%v", this.Cache))
	
	// Format Asks and Bids properly
	if this.Asks != nil {
		result.WriteString(fmt.Sprintf(" Asks:%s", this.Asks.String()))
	} else {
		result.WriteString(" Asks:nil")
	}
	
	if this.Bids != nil {
		result.WriteString(fmt.Sprintf(" Bids:%s", this.Bids.String()))
	} else {
		result.WriteString(" Bids:nil")
	}
	
	result.WriteString("}")
	return result.String()
}

func getAsksBids(snapshot interface{}) ([][]float64, [][]float64) {
	asks, ok := snapshot.(map[string]interface{})["asks"].([][]float64)
	if !ok {
		asks = [][]float64{}
	}
	bids, ok := snapshot.(map[string]interface{})["bids"].([][]float64)
	if !ok {
		bids = [][]float64{}
	}
	return asks, bids
}



// Replace toAsksBids with this if snapshot is coming from json.Unmarshal
// func getAsksBids(snapshot interface{}) ([][]float64, [][]float64) {
// 	asks := toFloat64SliceSlice(snapshot["asks"])
// 	bids := toFloat64SliceSlice(snapshot["bids"])
// 	return asks, bids
// }

// func toFloat64SliceSlice(value interface{}) [][]float64 {
// 	raw, ok := value.([]interface{})
// 	if !ok {
// 		return [][]float64{}
// 	}
// 	result := make([][]float64, 0, len(raw))
// 	for _, row := range raw {
// 		rowArr, ok := row.([]interface{})
// 		if !ok {
// 			continue
// 		}
// 		floatRow := make([]float64, 0, len(rowArr))
// 		for _, num := range rowArr {
// 			if f, ok := num.(float64); ok {
// 				floatRow = append(floatRow, f)
// 			}
// 		}
// 		result = append(result, floatRow)
// 	}
// 	return result
// }


// ----------------------------------------------------------------------------
// overwrites absolute volumes at price levels
// or deletes price levels based on order counts (3rd value in a bidask delta)

type CountedOrderBook struct {
	*WsOrderBook
}

func NewCountedOrderBook(snapshot interface{}, depth interface{}) *CountedOrderBook {
	if depth == nil {
		depth = math.MaxInt32
	}
	if snapshot == nil {
		snapshot = make(map[string]interface{})
	}
	// Sanitize snapshot to ensure asks and bids are always [][]float64
	asks, bids := getAsksBids(snapshot)
	snapshotMap := snapshot.(map[string]interface{})
	timestamp := SafeInt64(snapshotMap, "timestamp", 0).(int64)
	
	return &CountedOrderBook{
		WsOrderBook: &WsOrderBook{
			Cache:     SafeValue(snapshotMap, "cache", map[string]interface{}{}),
			Asks:      NewCountedAsks(asks, depth),
			Bids:      NewCountedBids(bids, depth),
			Timestamp: timestamp,
			Datetime:  Iso8601(timestamp),
			Nonce:     SafeInteger(snapshotMap, "nonce", nil),
			Symbol:    SafeString(snapshotMap, "symbol", "").(string),
		},
	}
}



// indexed by order ids (3rd value in a bidask delta)
type IndexedOrderBook struct {
	*WsOrderBook
}

func NewIndexedOrderBook(snapshot interface{}, depth interface{}) *IndexedOrderBook {
	if depth == nil {
		depth = math.MaxInt32
	}
	if snapshot == nil {
		snapshot = make(map[string]interface{})
	}
	// Sanitize snapshot to ensure asks and bids are always [][]float64
	asks, bids := getAsksBids(snapshot)
	snapshotMap := snapshot.(map[string]interface{})
	timestamp := SafeInt64(snapshotMap, "timestamp", 0).(int64)
	
	return &IndexedOrderBook{
		WsOrderBook: &WsOrderBook{
			Cache:     SafeValue(snapshotMap, "cache", map[string]interface{}{}),
			Asks:      NewIndexedAsks(asks, depth),
			Bids:      NewIndexedBids(bids, depth),
			Timestamp: timestamp,
			Datetime:  Iso8601(timestamp),
			Nonce:     SafeInteger(snapshotMap, "nonce", nil),
			Symbol:    SafeString(snapshotMap, "symbol", "").(string),
		},
	}
}

// ----------------------------------------------------------------------------
// adjusts the volumes by positive or negative relative changes or differences

// type IncrementalOrderBook struct {
// 	*WsOrderBook
// }

// func NewIncrementalOrderBook(snapshot interface{}, depth interface{}) *IncrementalOrderBook {
// 	asks, bids := getAsksBids(snapshot)
// 	return &IncrementalOrderBook{
// 		WsOrderBook: NewWsOrderBook(
// 			DeepExtend(snapshot, map[string]interface{}{
// 				"asks": NewIncrementalAsks(asks, depth),
// 				"bids": NewIncrementalBids(bids, depth),
// 			}),
// 			depth,
// 		),
// 	}
// }

// func (this *IncrementalOrderBook) Limit() interface{} {
// 	return this.WsOrderBook.Limit()
// }

// func (this *IncrementalOrderBook) Update(snapshot interface{}) interface{} {
// 	return this.WsOrderBook.Update(snapshot)
// }

// func (this *IncrementalOrderBook) Reset(snapshot interface{}) interface{} {
// 	return this.WsOrderBook.Reset(snapshot)
// }

// func (this *IncrementalOrderBook) GetCache() *interface{} {
// 	return &this.WsOrderBook.GetCache()
// }

// func (this *IncrementalOrderBook) SetCache(cache interface{}) {
// 	this.WsOrderBook.SetCache(cache)
// }


// // incremental and indexed (2 in 1)
// type IncrementalIndexedOrderBook struct {
// 	*WsOrderBook
// }

// func NewIncrementalIndexedOrderBook(snapshot interface{}, depth interface{}) *IncrementalIndexedOrderBook {
// 	asks, bids := getAsksBids(snapshot)
// 	return &IncrementalIndexedOrderBook{
// 		WsOrderBook: NewWsOrderBook(
// 			DeepExtend(snapshot, map[string]interface{}{
// 				"asks": NewIncrementalIndexedAsks(asks, depth),
// 				"bids": NewIncrementalIndexedBids(bids, depth),
// 			}),
// 			depth,
// 		),
// 	}
// }

// func (this *IncrementalIndexedOrderBook) Limit() interface{} {
// 	return this.WsOrderBook.Limit()
// }

// func (this *IncrementalIndexedOrderBook) Update(snapshot interface{}) interface{} {
// 	return this.WsOrderBook.Update(snapshot)
// }

// func (this *IncrementalIndexedOrderBook) Reset(snapshot interface{}) interface{} {
// 	return this.WsOrderBook.Reset(snapshot)
// }

// func (this *IncrementalIndexedOrderBook) GetCache() *interface{} {
// 	return &this.WsOrderBook.GetCache()
// }

// func (this *IncrementalIndexedOrderBook) SetCache(cache interface{}) {
// 	this.WsOrderBook.SetCache(cache)
// }

func (this *WsOrderBook) GetNonce() interface{} {
	return this.Nonce
}
func (this *CountedOrderBook) Limit() interface{} {
	return this.WsOrderBook.Limit()
}
func (this *CountedOrderBook) Update(snapshot interface{}) interface{} {
	return this.WsOrderBook.Update(snapshot)
}
func (this *CountedOrderBook) Reset(snapshot interface{}) interface{} {
	return this.WsOrderBook.Reset(snapshot)
}
func (this *CountedOrderBook) GetCache() *interface{} {
	return this.WsOrderBook.GetCache()
}
func (this *CountedOrderBook) SetCache(cache interface{}) {
	this.WsOrderBook.SetCache(cache)
}
func (this *CountedOrderBook) GetValue(key string, defaultValue interface{}) interface{} {
	return this.WsOrderBook.GetValue(key, defaultValue)
}
func (this *IndexedOrderBook) Limit() interface{} {
	return this.WsOrderBook.Limit()
}
func (this *IndexedOrderBook) Update(snapshot interface{}) interface{} {
	return this.WsOrderBook.Update(snapshot)
}
func (this *IndexedOrderBook) Reset(snapshot interface{}) interface{} {
	return this.WsOrderBook.Reset(snapshot)
}
func (this *IndexedOrderBook) GetCache() *interface{} {
	return this.WsOrderBook.GetCache()
}
func (this *IndexedOrderBook) SetCache(cache interface{}) {
	this.WsOrderBook.SetCache(cache)
}
func (this *IndexedOrderBook) GetValue(key string, defaultValue interface{}) interface{} {
	return this.WsOrderBook.GetValue(key, defaultValue)
}