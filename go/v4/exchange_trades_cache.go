package ccxt

// TradesCache is the ws trades cache (BaseExchange.Trades): one list cache per symbol, a plain map
// whose only owner is the exchange's ws dispatch loop, like OrderBookCache. Get answers the list
// cache itself or nil when absent.
type TradesCache map[string]WsArrayCache

func tradesCacheKey(k any) (string, bool) {
	s, ok := derefScalar(k).(string)
	return s, ok
}

func (c TradesCache) Load(k any) (WsArrayCache, bool) {
	key, ok := tradesCacheKey(k)
	if !ok || c == nil {
		return nil, false
	}
	v, found := c[key]
	return v, found
}

func (c TradesCache) Get(k any) WsArrayCache {
	v, _ := c.Load(k)
	return v
}

func (c TradesCache) Has(k any) bool {
	_, ok := c.Load(k)
	return ok
}

// Store keeps a list cache under the key; a value that is not a list cache is not stored.
func (c TradesCache) Store(k any, v any) {
	key, keyIsString := tradesCacheKey(k)
	stored, isCache := derefScalar(v).(WsArrayCache)
	if keyIsString && isCache && c != nil {
		c[key] = stored
	}
}

func (c TradesCache) Delete(k any) {
	if key, ok := tradesCacheKey(k); ok && c != nil {
		delete(c, key)
	}
}

func (c TradesCache) Keys() []string {
	keys := make([]string, 0, len(c))
	for k := range c {
		keys = append(keys, k)
	}
	return keys
}

// ToMap is a snapshot of the cache as a plain map.
func (c TradesCache) ToMap() map[string]any {
	out := make(map[string]any, len(c))
	for k, v := range c {
		out[k] = v
	}
	return out
}
