package ccxt

// TickerCache is the ws ticker / bidask cache (BaseExchange.Tickers / Bidsasks): a plain map whose
// only owner is the exchange's ws dispatch loop. The methods below are the map operations handler
// code (running on that loop) calls - no lock; user-path code asks the owner through WsCache*.
type TickerCache map[string]any

func tickerCacheKey(k any) (string, bool) {
	s, ok := derefScalar(k).(string)
	return s, ok
}

func (c TickerCache) Store(k any, v any) {
	if key, ok := tickerCacheKey(k); ok && c != nil {
		c[key] = v
	}
}

func (c TickerCache) Load(k any) (any, bool) {
	key, ok := tickerCacheKey(k)
	if !ok || c == nil {
		return nil, false
	}
	v, found := c[key]
	return v, found
}

// Get answers the stored value or nil when absent.
func (c TickerCache) Get(k any) any {
	v, _ := c.Load(k)
	return v
}

func (c TickerCache) Has(k any) bool {
	_, ok := c.Load(k)
	return ok
}

func (c TickerCache) Delete(k any) {
	if key, ok := tickerCacheKey(k); ok && c != nil {
		delete(c, key)
	}
}

func (c TickerCache) Keys() []string {
	keys := []string{}
	for k := range c {
		keys = append(keys, k)
	}
	return keys
}

// ToMap is a snapshot of the cache as a plain map.
func (c TickerCache) ToMap() map[string]any {
	out := map[string]any{}
	for k, v := range c {
		out[k] = v
	}
	return out
}
