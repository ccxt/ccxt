package ccxt

// OrderBook aggregates asks and bids; implementation moved to
// exchange_orderbookside.go for clarity.

// OrderBook struct is defined in exchange_types.go

func NewOrderBook(orderbook2 interface{}) OrderBook {
	orderbook := orderbook2.(map[string]interface{})
	return OrderBook{
		Bids:      parseOrderBookEntries(orderbook, "bids"),
		Asks:      parseOrderBookEntries(orderbook, "asks"),
		Symbol:    SafeStringTyped(orderbook, "symbol"),
		Timestamp: SafeInt64Typed(orderbook, "timestamp"),
		Datetime:  SafeStringTyped(orderbook, "datetime"),
		Nonce:     SafeInt64Typed(orderbook, "nonce"),
		Cache:     []interface{}{},
	}
}

// parseOrderBookEntries is defined in exchange_types.go

// Limit keeps fluent interface used in generated code.
func (ob *OrderBook) Limit() *OrderBook {
	// In JS this caps asks/bids to depth. Our [][]float64 representation lacks
	// depth metadata, so we expose a no-op that preserves the chainability
	// expected by generated code.
	return ob
}

// GetLimit makes OrderBook satisfy the GetsLimit interface used by Futures.
// OrderBook itself does not manage dynamic limits, so we forward the caller
// provided value unchanged.
func (ob *OrderBook) GetLimit(symbol interface{}, limit interface{}) interface{} {
	return limit
}

// Update overwrites metadata if the incoming snapshot has a newer nonce / ts.
func (ob *OrderBook) Update(snapshot interface{}) *OrderBook {
	if n, ok := snapshot.(map[string]interface{})["nonce"].(int64); ok {
		if ob.Nonce != nil && n <= *ob.Nonce {
			return ob
		}
		ob.Nonce = &n
	}
	if ts, ok := snapshot.(map[string]interface{})["timestamp"].(int64); ok {
		ob.Timestamp = &ts
	}
	return ob.Reset(snapshot)
}

// Reset clears current state and loads levels from the given snapshot map.
// The snapshot is expected to be a map[string]interface{} with optional keys
// "asks", "bids", "nonce", "timestamp", "symbol".
func (ob *OrderBook) Reset(snapshot interface{}) *OrderBook {
	// clear current slices
	ob.Asks = nil
	ob.Bids = nil
	ob.Cache = []interface{}{}

	if snap, ok := snapshot.(map[string]interface{}); ok {
		ob.Asks = parseOrderBookEntries(snap, "asks")
		ob.Bids = parseOrderBookEntries(snap, "bids")

		ob.Symbol = SafeStringTyped(snap, "symbol")
		ob.Timestamp = SafeInt64Typed(snap, "timestamp")
		ob.Datetime = SafeStringTyped(snap, "datetime")
		ob.Nonce = SafeInt64Typed(snap, "nonce")
	}

	return ob
} 