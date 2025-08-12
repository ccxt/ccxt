package ccxt

import (
	"sync"
)

// Per Exchange only stored markets data
var globalMarkets = NewMarkets()

type UnifiedMarket struct {
	Markets          *sync.Map
	Markets_by_id    *sync.Map
	Currencies       *sync.Map
	Currencies_by_id *sync.Map
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

func (u *UnifiedMarkets) GetOrCreateUnifiedMarket(marketName string) UnifiedMarket {
	u.marketsRwMu.RLock()
	market, ok := u.markets[marketName]
	u.marketsRwMu.RUnlock()

	if !ok {
		market = UnifiedMarket{
			Markets:          &sync.Map{},
			Markets_by_id:    &sync.Map{},
			Currencies:       &sync.Map{},
			Currencies_by_id: &sync.Map{},
		}
		u.marketsRwMu.Lock()
		u.markets[marketName] = market
		u.marketsRwMu.Unlock()
	}

	return market
}
