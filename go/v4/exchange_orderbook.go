package ccxt

// type CustomOrderBookProp interface {
// 	cache []any
// }

type WsOrderBook struct {
	GetsLimit
	Cache     interface{}
	Asks      *OrderBookSide
	Bids      *OrderBookSide
	Timestamp int64
	Datetime  interface{}
	Nonce     int64
	Symbol    string
}

func NewWsOrderBook(snapshot interface{}, depth interface{}) WsOrderBook {
	// TODO: double check
    // Handle default parameters
    if snapshot == nil {
        snapshot = make(map[string]interface{})
    }
    
    var finalDepth *int
    if depth != nil {
        finalDepth = depth.(*int)
    } else {
        finalDepth = nil
    }
    
    ob := WsOrderBook{
        Cache: make(map[string]interface{}, 0), // equivalent to cache: []
    }
    
    // Set defaults
    defaults := map[string]interface{}{
        "bids":      make([][]float64, 0),
        "asks":      make([][]float64, 0),
        "timestamp": nil,
        "datetime":  nil,
        "nonce":     nil,
        "symbol":    nil,
    }
    
    // Merge defaults with snapshot
    merged := make(map[string]interface{})
    for k, v := range defaults {
        merged[k] = v
    }
    for k, v := range snapshot.(map[string]interface{}) {
        merged[k] = v
    }
    
    // Extract values from merged map
    if val, ok := merged["timestamp"]; ok && val != nil {
        if timestamp, ok := val.(int64); ok {
            ob.Timestamp = timestamp
            ob.Datetime = Iso8601(timestamp)
        }
    }
    
    if val, ok := merged["nonce"]; ok && val != nil {
        if nonce, ok := val.(int64); ok {
            ob.Nonce = nonce
        }
    }
    
    if val, ok := merged["symbol"]; ok && val != nil {
        if symbol, ok := val.(string); ok {
            ob.Symbol = symbol
        }
    }
    
    // Handle asks - wrap with Asks class if necessary
    if val, ok := merged["asks"]; ok && val != nil {
        if asksData, ok := val.([][]float64); ok {
            ob.Asks = NewAsks(asksData, finalDepth)
        } else {
            // Default empty asks
            ob.Asks = NewAsks(make([][]float64, 0), finalDepth)
        }
    } else {
        ob.Asks = NewAsks(make([][]float64, 0), finalDepth)
    }
    
    // Handle bids - wrap with Bids class if necessary  
    if val, ok := merged["bids"]; ok && val != nil {
        if bidsData, ok := val.([][]float64); ok {
            ob.Bids = NewBids(bidsData, finalDepth)
        } else {
            // Default empty bids
            ob.Bids = NewBids(make([][]float64, 0), finalDepth)
        }
    } else {
        ob.Bids = NewBids(make([][]float64, 0), finalDepth)
    }
    
    return ob
}

func (this *WsOrderBook) Limit() *WsOrderBook {
	// Call limit methods on Asks and Bids if they exist
	this.Asks.Limit()
	this.Bids.Limit()
	return this
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
	
	// Reset asks by recreating them
	var asksData [][]float64
	if val, ok := snapshot.(map[string]interface{})["asks"].([][]float64); ok && val != nil {
		asksData = val
	} else {
		asksData = make([][]float64, 0)
	}
	this.Asks = NewAsks(asksData, nil)
	
	// Reset bids by recreating them
	var bidsData [][]float64
	if val, ok := snapshot.(map[string]interface{})["bids"].([][]float64); ok && val != nil {
		bidsData = val
	} else {
		bidsData = make([][]float64, 0)
	}
	this.Bids = NewBids(bidsData, nil)
	
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