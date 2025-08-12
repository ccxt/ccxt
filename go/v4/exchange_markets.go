package ccxt

import (
	"sync"
)

// Per Exchange only stored markets data
var globalMarkets = NewMarkets()

type UnifiedMarket struct {
	markets *sync.Map
}

type UnifiedMarkets struct {
	markets     map[string]UnifiedMarket
	marketsRwMu sync.RWMutex
}

func NewMarkets() UnifiedMarkets {
	return UnifiedMarkets{
		markets:     map[string]UnifiedMarket{},
		marketsRwMu: sync.RWMutex{},
	}
}

func (u *UnifiedMarkets) GetUnifiedMarket(marketName string) (UnifiedMarket, bool) {
	u.marketsRwMu.RLock()
	defer u.marketsRwMu.RUnlock()

	market, ok := u.markets[marketName]
	if !ok {
		return UnifiedMarket{}, false
	}

	return market, true
}

// Insert the unified market to the global map
func (u *UnifiedMarkets) InsertUnifiedMarket(market *sync.Map, marketName string) {
	u.marketsRwMu.Lock()
	defer u.marketsRwMu.Unlock()

	u.markets[marketName] = UnifiedMarket{
		markets: market,
	}
}
