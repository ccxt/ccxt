package ccxt

// OrderBookCache is the ws order book cache (BaseExchange.Orderbooks): a plain map whose only
// owner is the exchange's ws dispatch loop. Handler code (running on that loop) calls the methods
// below - no lock; user-path code asks the owner through WsCache*. Get answers the book itself.
type OrderBookCache map[string]OrderBookInterface

func orderBookCacheKey(k any) (string, bool) {
	s, ok := derefScalar(k).(string)
	return s, ok
}

// Store keeps a book under the key; a value that is not a book is stored as nil.
func (c OrderBookCache) Store(k any, v any) {
	if key, ok := orderBookCacheKey(k); ok && c != nil {
		c[key] = OrderBookTyped(derefScalar(v))
	}
}

func (c OrderBookCache) Load(k any) (OrderBookInterface, bool) {
	key, ok := orderBookCacheKey(k)
	if !ok || c == nil {
		return nil, false
	}
	v, found := c[key]
	return v, found
}

// Get answers the stored book or nil when absent.
func (c OrderBookCache) Get(k any) OrderBookInterface {
	v, _ := c.Load(k)
	return v
}

// GetOr is SafeValue with a default: the default stands in for an absent or nil book.
func (c OrderBookCache) GetOr(k any, def any) OrderBookInterface {
	if v := c.Get(k); v != nil {
		return v
	}
	return OrderBookTyped(derefScalar(def))
}

func (c OrderBookCache) Has(k any) bool {
	_, ok := c.Load(k)
	return ok
}

func (c OrderBookCache) Delete(k any) {
	if key, ok := orderBookCacheKey(k); ok && c != nil {
		delete(c, key)
	}
}

func (c OrderBookCache) Keys() []string {
	keys := []string{}
	for k := range c {
		keys = append(keys, k)
	}
	return keys
}

// ToMap is a snapshot of the cache as a plain map.
func (c OrderBookCache) ToMap() map[string]any {
	out := make(map[string]any, len(c))
	for k, v := range c {
		out[k] = v
	}
	return out
}
