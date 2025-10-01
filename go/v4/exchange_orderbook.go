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
	Reset(optionalArgs ...interface{}) interface{}
	GetCache() *interface{}
	SetCache(cache interface{})
	GetNonce() interface{}
	GetValue(key string, defaultValue interface{}) interface{}
	ToMap() map[string]interface{}
}

type WsOrderBook struct {
	Cache     interface{}    `json:"-"`
	Asks      IOrderBookSide `json:"asks"`
	Bids      IOrderBookSide `json:"bids"`
	Timestamp int64          `json:"timestamp"`
	Datetime  interface{}    `json:"datetime"`
	Nonce     interface{}    `json:"nonce"`
	Symbol    string         `json:"symbol"`
}

func strOrNil(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}

func createOb(Obtype string) OrderBookInterface {
	switch strings.ToLower(Obtype) {
	case "counted":
		return &CountedOrderBook{}
	case "indexed":
		return &IndexedOrderBook{}
	// case "incremental":
	// 	return &IncrementalOrderBook{}
	// case "incrementalindexed":
	// 	return &IncrementalIndexedOrderBook{}
	default:
		return &WsOrderBook{}
	}
}

func (this *WsOrderBook) ToMap() map[string]interface{} {
	return map[string]interface{}{
		"asks":      this.Asks.GetDataCopy(),
		"bids":      this.Bids.GetDataCopy(),
		"timestamp": this.Timestamp,
		"datetime":  this.Datetime,
		"nonce":     this.Nonce,
		"symbol":    strOrNil(this.Symbol),
	}
}

func (this *WsOrderBook) GetValue(key string, defaultValue interface{}) interface{} {
	switch key {
	case "nonce":
		return this.Nonce
	case "cache":
		return this.Cache
	case "asks":
		return this.Asks
	case "bids":
		return this.Bids
	case "timestamp":
		return this.Timestamp
	case "datetime":
		return this.Datetime
	case "symbol":
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
		Cache:     SafeValue(snapshotMap, "cache", []interface{}{}),
		Asks:      NewAsks(asks, depth),
		Bids:      NewBids(bids, depth),
		Timestamp: timestamp,
		Datetime:  Iso8601(timestamp),
		Nonce:     SafeInteger(snapshotMap, "nonce", nil),
		Symbol:    SafeString(snapshotMap, "symbol", "").(string),
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

func (this *WsOrderBook) Reset(optionalArgs ...interface{}) interface{} {
	snapshot := GetArg(optionalArgs, 0, nil)

	if snapshot == nil {
		snapshot = make(map[string]interface{})
	}
	asks, bids := getAsksBids(snapshot)
	snapshotMap := snapshot.(map[string]interface{})

	for i := range *this.Asks.GetIndex() {
		(*this.Asks.GetIndex())[i] = math.MaxFloat64
	}
	this.Asks.SetData([][]interface{}{})
	this.Asks.SetLen(0)
	for _, ask := range asks {
		this.Asks.StoreArray(ask)
	}

	for i := range *this.Bids.GetIndex() {
		(*this.Bids.GetIndex())[i] = math.MaxFloat64
	}
	this.Bids.SetData([][]interface{}{})
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

func normalizeToFloat64SliceSlice(value interface{}) [][]float64 {
	raw, ok := value.([]interface{})
	if !ok {
		return [][]float64{}
	}
	result := make([][]float64, 0, len(raw))
	for _, row := range raw {
		rowArr, ok := row.([]interface{})
		if !ok {
			continue
		}
		floatRow := make([]float64, 0, len(rowArr))
		for _, num := range rowArr {
			if f, ok := num.(float64); ok {
				floatRow = append(floatRow, f)
			} else if i, ok := num.(int); ok {
				floatRow = append(floatRow, float64(i))
			} else if i64, ok := num.(int64); ok {
				floatRow = append(floatRow, float64(i64))
			} else if f32, ok := num.(float32); ok {
				floatRow = append(floatRow, float64(f32))
			}
		}
		result = append(result, floatRow)
	}
	return result
}

func getAsksBids(snapshot interface{}) ([][]float64, [][]float64) {
	asks := normalizeToFloat64SliceSlice(SafeValue(snapshot, "asks", nil))
	bids := normalizeToFloat64SliceSlice(SafeValue(snapshot, "bids", nil))
	return asks, bids
}

func getIndexedAsksBids(snapshot interface{}) ([][]interface{}, [][]interface{}) {
	asks := SafeValue(snapshot, "asks", nil)
	bids := SafeValue(snapshot, "bids", nil)
	// normalize the price and size and keep the id as is (3rd value in a bidask delta)
	// so that it can be used as a key in IndexedOrderBookSide
	if asks == nil || bids == nil {
		return [][]interface{}{}, [][]interface{}{}
	}
	// Normalize the price and size
	newAsks := make([][]interface{}, len(asks.([]interface{})))
	newBids := make([][]interface{}, len(bids.([]interface{})))
	for i := range asks.([]interface{}) {
		newAsks[i] = []interface{}{
			normalizeNumber(asks.([]interface{})[i].([]interface{})[0]),
			normalizeNumber(asks.([]interface{})[i].([]interface{})[1]),
			asks.([]interface{})[i].([]interface{})[2],
		}
	}
	for i := range bids.([]interface{}) {
		newBids[i] = []interface{}{
			normalizeNumber(bids.([]interface{})[i].([]interface{})[0]),
			normalizeNumber(bids.([]interface{})[i].([]interface{})[1]),
			bids.([]interface{})[i].([]interface{})[2],
		}
	}
	return newAsks, newBids
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
	asks, bids := getIndexedAsksBids(snapshot)
	snapshotMap := snapshot.(map[string]interface{})
	timestamp := SafeInt64(snapshotMap, "timestamp", 0).(int64)

	return &CountedOrderBook{
		WsOrderBook: &WsOrderBook{
			Cache:     SafeValue(snapshotMap, "cache", []interface{}{}),
			Asks:      NewCountedAsks(asks, depth),
			Bids:      NewCountedBids(bids, depth),
			Timestamp: timestamp,
			Datetime:  Iso8601(timestamp),
			Nonce:     SafeInteger(snapshotMap, "nonce", nil),
			Symbol:    SafeString(snapshotMap, "symbol", "").(string),
		},
	}
}

func (this *CountedOrderBook) ToMap() map[string]interface{} {
	return map[string]interface{}{
		"asks":      this.Asks.GetDataCopy(),
		"bids":      this.Bids.GetDataCopy(),
		"timestamp": this.Timestamp,
		"datetime":  this.Datetime,
		"nonce":     this.Nonce,
		"symbol":    strOrNil(this.Symbol),
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
	asks, bids := getIndexedAsksBids(snapshot)
	snapshotMap := snapshot.(map[string]interface{})
	timestamp := SafeInt64(snapshotMap, "timestamp", 0).(int64)

	return &IndexedOrderBook{
		WsOrderBook: &WsOrderBook{
			Cache:     SafeValue(snapshotMap, "cache", []interface{}{}),
			Asks:      NewIndexedAsks(asks, depth),
			Bids:      NewIndexedBids(bids, depth),
			Timestamp: timestamp,
			Datetime:  Iso8601(timestamp),
			Nonce:     SafeInteger(snapshotMap, "nonce", nil),
			Symbol:    SafeString(snapshotMap, "symbol", "").(string),
		},
	}
}

func (this *IndexedOrderBook) ToMap() map[string]interface{} {
	return map[string]interface{}{
		"asks":      this.Asks.GetDataCopy(),
		"bids":      this.Bids.GetDataCopy(),
		"timestamp": this.Timestamp,
		"datetime":  this.Datetime,
		"nonce":     this.Nonce,
		"symbol":    strOrNil(this.Symbol),
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
func (this *CountedOrderBook) Reset(optionalArgs ...interface{}) interface{} {
	return this.WsOrderBook.Reset(optionalArgs...)
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
func (this *IndexedOrderBook) Reset(optionalArgs ...interface{}) interface{} {
	return this.WsOrderBook.Reset(optionalArgs...)
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
