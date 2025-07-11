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

// Returns nil if market wasn't found
func (u *UnifiedMarkets) GetUnifiedMarket(marketName string) (UnifiedMarket, bool) {
	u.marketsRwMu.RLock()
	defer u.marketsRwMu.RUnlock()

	market, ok := u.markets[marketName]
	if !ok {
		return UnifiedMarket{}, false
	}

	return market, true
}

func (u *UnifiedMarkets) InsertUnifiedMarket(market *sync.Map, marketName string) {
	u.marketsRwMu.Lock()
	defer u.marketsRwMu.Unlock()

	u.markets[marketName] = UnifiedMarket{
		markets: market,
	}
}

// Make sure that this function is being run with no extra pending goroutines
//
// Because of the reassignment of mutex we can get some bad stuff
// MarketsMutex won't be locked
func ApplyGlobalMarkets(e *Exchange) bool {
	return true
}
