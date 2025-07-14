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

func NewWsOrderBook(snapshot interface{}, depth interface{}) WsOrderBook {
    // Sanitize snapshot to ensure asks and bids are always [][]float64
    if snapshotMap, ok := snapshot.(map[string]interface{}); ok {
        if _, ok := snapshotMap["asks"]; !ok {
            snapshotMap["asks"] = [][]float64{}
    } else {
            // Convert to [][]float64 if needed
            if arr, ok := snapshotMap["asks"].([]interface{}); ok {
                asks := [][]float64{}
                for _, v := range arr {
                    if row, ok := v.([]float64); ok {
                        asks = append(asks, row)
        }
    }
                snapshotMap["asks"] = asks
            }
        }
        if _, ok := snapshotMap["bids"]; !ok {
            snapshotMap["bids"] = [][]float64{}
        } else {
            if arr, ok := snapshotMap["bids"].([]interface{}); ok {
                bids := [][]float64{}
                for _, v := range arr {
                    if row, ok := v.([]float64); ok {
                        bids = append(bids, row)
                    }
                }
                snapshotMap["bids"] = bids
            }
        }
    }
    
    ob := WsOrderBook{
        Asks: NewAsks(GetValue(snapshot, "asks"), depth),
        Bids: NewBids(GetValue(snapshot, "bids"), depth),
    }
    
    return ob
}

func (this *WsOrderBook) Limit() WsOrderBook {
	// Call limit methods on Asks and Bids if they exist
	this.Asks.Limit()
	this.Bids.Limit()
	return *this
}

func (this *WsOrderBook) Update(snapshot interface{}) *WsOrderBook {
	// Convert JavaScript logic to Go
	if snapshotNonce, ok := snapshot.(map[string]interface{})["nonce"].(int64); ok {
		if this.Nonce != 0 && snapshotNonce <= this.Nonce {
			return this
		}
		this.Nonce = snapshotNonce
	}
	
	if timestamp, ok := snapshot.(map[string]interface{})["timestamp"].(int64); ok {
		this.Timestamp = timestamp
		this.Datetime = Iso8601(timestamp)
	}
	
	return this.Reset(snapshot)
}

func (this *WsOrderBook) Reset(snapshot interface{}) *WsOrderBook {
	// Handle default parameter - snapshot defaults to {}
	if snapshot == nil {
		snapshot = make(map[string]interface{})
	}
	
	// Reset asks by clearing and repopulating existing object (like TypeScript)
	if this.Asks != nil {
		// Clear the existing asks
		for i := range this.Asks.index {
			this.Asks.index[i] = math.MaxFloat64
		}
		this.Asks.length = 0
		this.Asks.data = this.Asks.data[:0] // Clear the slice but keep capacity
		
		// Repopulate with new data
		if val, ok := snapshot.(map[string]interface{})["asks"]; ok && val != nil {
			if asksData, ok := val.([][]float64); ok {
				for _, ask := range asksData {
					if len(ask) >= 2 {
						this.Asks.StoreArray(ask)
					}
				}
			}
		}
	}
	
	// Reset bids by clearing and repopulating existing object (like TypeScript)
	if this.Bids != nil {
		// Clear the existing bids
		for i := range this.Bids.index {
			this.Bids.index[i] = math.MaxFloat64
		}
		this.Bids.length = 0
		this.Bids.data = this.Bids.data[:0] // Clear the slice but keep capacity
		
		// Repopulate with new data
		if val, ok := snapshot.(map[string]interface{})["bids"]; ok && val != nil {
			if bidsData, ok := val.([][]float64); ok {
				for _, bid := range bidsData {
					if len(bid) >= 2 {
						this.Bids.StoreArray(bid)
					}
				}
			}
		}
	}
	
	// Set properties from snapshot
	if nonce, ok := snapshot.(map[string]interface{})["nonce"].(int64); ok {
		this.Nonce = nonce
	}
	
	if timestamp, ok := snapshot.(map[string]interface{})["timestamp"].(int64); ok {
		this.Timestamp = timestamp
		this.Datetime = Iso8601(timestamp)
	}
	
	if symbol, ok := snapshot.(map[string]interface{})["symbol"].(string); ok {
		this.Symbol = symbol
	}
	
	return this
}

// Might need if IndexedOrder and CountedOrderBook access the cache
func (this *WsOrderBook) GetCache() interface{} {
	return this.Cache
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

func NewCountedOrderBook(snapshot interface{}, depth interface{}) CountedOrderBook {
	asks, bids := getAsksBids(snapshot)
	ob := NewWsOrderBook(
		DeepExtend(snapshot, map[string]interface{}{
			"asks": NewCountedAsks(asks, depth),
			"bids": NewCountedBids(bids, depth),
		}),
		depth,
	)
	return CountedOrderBook{
		WsOrderBook: &ob,
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

// indexed by order ids (3rd value in a bidask delta)
type IndexedOrderBook struct {
	*WsOrderBook
}

func NewIndexedOrderBook(snapshot interface{}, depth interface{}) IndexedOrderBook {
	asks, bids := getAsksBids(snapshot)
	ob := NewWsOrderBook(
		DeepExtend(snapshot, map[string]interface{}{
			"asks": NewIndexedAsks(asks, depth),
			"bids": NewIndexedBids(bids, depth),
		}),
		depth,
	)
	return IndexedOrderBook{
		WsOrderBook: &ob,
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

// ----------------------------------------------------------------------------
// adjusts the volumes by positive or negative relative changes or differences

// type IncrementalOrderBook struct {
// 	*WsOrderBook
// }

// func NewIncrementalOrderBook(snapshot interface{}, depth interface{}) IncrementalOrderBook {
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


// // incremental and indexed (2 in 1)
// type IncrementalIndexedOrderBook struct {
// 	*WsOrderBook
// }

// func NewIncrementalIndexedOrderBook(snapshot interface{}, depth interface{}) IncrementalIndexedOrderBook {
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