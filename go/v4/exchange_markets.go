package ccxt

import (
	"sync"
)

// Per Exchange only stored markets data
var globalMarkets = NewMarkets()

// Per Exchange only stored mutexes
var globalMutexes = NewMutexes()

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

// ====================
// UnifiedMutexes
// ====================

type UnifiedMutexes struct {
	mutexes    map[string]*sync.Mutex
	mutexesRwM sync.RWMutex
}

func NewMutexes() UnifiedMutexes {
	return UnifiedMutexes{
		mutexes:    map[string]*sync.Mutex{},
		mutexesRwM: sync.RWMutex{},
	}
}

func (u *UnifiedMutexes) GetOrCreateMutex(key string) *sync.Mutex {
	u.mutexesRwM.RLock()
	m, ok := u.mutexes[key]
	u.mutexesRwM.RUnlock()

	if !ok {
		m = &sync.Mutex{}
		u.mutexesRwM.Lock()
		u.mutexes[key] = m
		u.mutexesRwM.Unlock()
	}

	return m
}

func (u *UnifiedMutexes) SetMutex(key string, mutex *sync.Mutex) {
	u.mutexesRwM.Lock()
	defer u.mutexesRwM.Unlock()
	u.mutexes[key] = mutex
}

func (u *UnifiedMutexes) GetMutex(key string) (*sync.Mutex, bool) {
	u.mutexesRwM.RLock()
	defer u.mutexesRwM.RUnlock()
	m, ok := u.mutexes[key]
	return m, ok
}
