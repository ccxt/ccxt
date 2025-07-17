package ccxt

import "math"

// type CustomOrderBookProp interface {
// 	cache []any
// }

type OrderBookInterface interface {
    Limit() interface{}
    Update(snapshot interface{}) interface{}
    Reset(snapshot interface{}) interface{}
	GetCache() interface{}
	SetCache(cache interface{})
}

type WsOrderBook struct {
	Cache     interface{}
	Asks      *OrderBookSide
	Bids      *OrderBookSide
	Timestamp int64
	Datetime  interface{}
	Nonce     int64
	Symbol    string
}

func NewWsOrderBook(snapshot interface{}, depth interface{}) *WsOrderBook {
    // Sanitize snapshot to ensure asks and bids are always [][]float64
	orderbook := &WsOrderBook{}
	if depth == nil {
		depth = math.MaxInt32
	}
	var cache     interface{}
	var asks      *OrderBookSide
	var bids      *OrderBookSide
	var timestamp int64
	var datetime  interface{}
	var nonce     int64
	var symbol    string

	if snapshot == nil {
		snapshot = make(map[string]interface{})
	}
	snapshotMap := snapshot.(map[string]interface{})
	if snapshotMap["cache"] != nil {
		cache = snapshotMap["cache"]
	} else {
		cache = map[string]interface{}{}
	}
	if snapshotMap["bids"] != nil {
		bids = NewAsks(snapshotMap["bids"], depth)
	} else {
		bids = NewAsks(nil, depth)
	}
	if snapshotMap["asks"] != nil {
		asks = NewAsks(snapshotMap["asks"], depth)
	} else {
		asks = NewAsks(nil, depth)
	}
	if snapshotMap["timestamp"] != nil {
		timestamp = snapshotMap["timestamp"].(int64)
		datetime = Iso8601(timestamp)
	} else {
		timestamp = 0
		datetime = nil
	}
	if snapshotMap["nonce"] != nil {
		nonce = snapshotMap["nonce"].(int64)
	} else {
		nonce = 0
	}
	if snapshotMap["symbol"] != nil {
		symbol = snapshotMap["symbol"].(string)
	} else {
		symbol = ""
	}
	orderbook = &WsOrderBook{
		Cache: cache,
		Asks: asks,
		Bids: bids,
		Timestamp: timestamp,
		Datetime: datetime,
		Nonce: nonce,
		Symbol: symbol,
	}
	return orderbook
}

func (this *WsOrderBook) Limit() *WsOrderBook {
    // Ensure child sides are depth-limited in-place and return the same pointer
	this.Asks.Limit()
	this.Bids.Limit()
    return this
}

func (this *WsOrderBook) Update(snapshot interface{}) *WsOrderBook {
	// Convert JavaScript logic to Go
	if snapshotNonce, ok := snapshot.(map[string]interface{})["nonce"]; ok {
		if this.Nonce != 0 && snapshotNonce.(int64) <= this.Nonce {
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

func (this *WsOrderBook) Reset(snapshot interface{}) *WsOrderBook {
	if snapshot == nil {
		snapshot = make(map[string]interface{})
	}
	
	// Clear the existing asks - exactly like TypeScript index.fill(Number.MAX_VALUE)
	for i := range this.Asks.Index {
		this.Asks.Index[i] = math.MaxFloat64
	}
	this.Asks.Length = 0
	this.Asks.Data = this.Asks.Data[:0] // Clear data array
	
	// Clear the existing bids - exactly like TypeScript index.fill(Number.MAX_VALUE) 
	for i := range this.Bids.Index {
		this.Bids.Index[i] = math.MaxFloat64
	}
	this.Bids.Length = 0
	this.Bids.Data = this.Bids.Data[:0] // Clear data array
	
	// Repopulate with new data
	if val, ok := snapshot.(map[string]interface{})["asks"]; ok && val != nil {
		for _, ask := range val.([][]float64) {
			this.Asks.StoreArray(ask)
		}
	}
	if val, ok := snapshot.(map[string]interface{})["bids"]; ok && val != nil {
		for _, ask := range val.([][]float64) {
			this.Bids.StoreArray(ask)
		}
	}
	
	// Set properties from snapshot
	if nonce, ok := snapshot.(map[string]interface{})["nonce"]; ok {
		this.Nonce = nonce.(int64)
	}
	
	if timestamp, ok := snapshot.(map[string]interface{})["timestamp"]; ok {
		this.Timestamp = timestamp.(int64)
		this.Datetime = Iso8601(timestamp)
	}
	
	if symbol, ok := snapshot.(map[string]interface{})["symbol"]; ok {
		this.Symbol = symbol.(string)
	}
	
	return this
}

// Might need if IndexedOrder and CountedOrderBook access the cache
func (this *WsOrderBook) GetCache() interface{} {
	return this.Cache
}

func (this *WsOrderBook) SetCache(cache interface{}) {
	this.Cache = cache
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
	asks, bids := getAsksBids(snapshot)
	ob := NewWsOrderBook(
		DeepExtend(snapshot, map[string]interface{}{
			"asks": NewCountedAsks(asks, depth),
			"bids": NewCountedBids(bids, depth),
		}),
		depth,
	)
	return &CountedOrderBook{
		WsOrderBook: ob,
	}
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

func (this *CountedOrderBook) GetCache() interface{} {
	return this.WsOrderBook.GetCache()
}

func (this *CountedOrderBook) SetCache(cache interface{}) {
	this.WsOrderBook.SetCache(cache)
}

// indexed by order ids (3rd value in a bidask delta)
type IndexedOrderBook struct {
	*WsOrderBook
}

func NewIndexedOrderBook(snapshot interface{}, depth interface{}) *IndexedOrderBook {
	asks, bids := getAsksBids(snapshot)
	ob := NewWsOrderBook(
		DeepExtend(snapshot, map[string]interface{}{
			"asks": NewIndexedAsks(asks, depth),
			"bids": NewIndexedBids(bids, depth),
		}),
		depth,
	)
	return &IndexedOrderBook{
		WsOrderBook: ob,
	}
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

func (this *IndexedOrderBook) GetCache() interface{} {
	return this.WsOrderBook.GetCache()
}

func (this *IndexedOrderBook) SetCache(cache interface{}) {
	this.WsOrderBook.SetCache(cache)
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

// func (this *IncrementalOrderBook) GetCache() interface{} {
// 	return this.WsOrderBook.GetCache()
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

// func (this *IncrementalIndexedOrderBook) GetCache() interface{} {
// 	return this.WsOrderBook.GetCache()
// }

// func (this *IncrementalIndexedOrderBook) SetCache(cache interface{}) {
// 	this.WsOrderBook.SetCache(cache)
// }