// wrapper.go  – DROP IN AS–IS
package ccxtwrapper

import (
	"encoding/json"
	"fmt"
	"sync"

	ccxt "github.com/ccxt/ccxt/go/v4"
)

/* ---------------------------------------------------------------- *
 * Exported Go type – appears in Swift / Objective-C as `Wrapper`   *
 * ---------------------------------------------------------------- */
type Wrapper struct{}

/* ---------------- internal registry of live exchanges ----------- */
var (
	reg    = map[uint64]ccxt.IExchange{}
	regMu  sync.Mutex
	nextID uint64 = 1
)

/* ---------------- InitExchange ---------------------------------- */
func (Wrapper) InitExchange(name, cfg string) uint64 {
	var conf map[string]interface{}
	if err := json.Unmarshal([]byte(cfg), &conf); err != nil {
		return 0
	}
	ex := ccxt.Exchange{}
	inst, ok := ccxt.DynamicallyCreateInstance(name, ex.DeepExtend(nil, conf))
	if !ok {
		return 0
	}
	regMu.Lock()
	id := nextID
	nextID++
	reg[id] = inst
	regMu.Unlock()
	return id
}

/* ---------------- FetchMarkets ---------------------------------- */
func (Wrapper) FetchMarkets(id uint64) string {
	if ex := loadMarkets(id); ex != nil {
		if res := <-ex.FetchMarkets(nil); ok(&res) {
			b, _ := json.Marshal(res)
			return string(b)
		}
	}
	return `{"error":"Invalid handle"}`
}

/* ---------------- FetchCurrencies ------------------------------- */
func (Wrapper) FetchCurrencies(id uint64) string {
	if ex := loadMarkets(id); ex != nil {
		if res := <-ex.FetchCurrencies(nil); ok(&res) {
			b, _ := json.Marshal(res)
			return string(b)
		}
	}
	return `{"error":"Invalid handle"}`
}

/* ---------------- FetchTicker ----------------------------------- */
func (Wrapper) FetchTicker(id uint64, symbol string) string {
	if ex := loadMarkets(id); ex != nil {
		if res := <-ex.FetchTicker(symbol, nil); ok(&res) {
			b, _ := json.Marshal(res)
			return string(b)
		}
	}
	return `{"error":"Invalid handle"}`
}

/* ---------------------------------------------------------------- *
 *                        helper functions                          *
 * ---------------------------------------------------------------- */
func get(id uint64) ccxt.IExchange {
	regMu.Lock()
	defer regMu.Unlock()
	return reg[id]
}

func loadMarkets(id uint64) ccxt.IExchange {
	ex := get(id)
	if ex == nil {
		return nil
	}
	if r := <-ex.LoadMarkets(); ok(&r) {
		return ex
	}
	return nil
}

func ok(ptr *interface{}) bool {
	if err, yes := (*ptr).(error); yes {
		*ptr = fmt.Sprintf(`{"error":"%s"}`, err.Error())
		return false
	}
	return true
}
