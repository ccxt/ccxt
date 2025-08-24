package examples

import (
	"fmt"
	"runtime"
	"runtime/debug"

	"ccxt/go/ccxt"
)

func getMemoryUsage() float64 {
	// Force garbage collection to get accurate memory stats
	runtime.GC()
	debug.FreeOSMemory()

	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	// Convert bytes to MB
	return float64(m.Alloc) / 1024 / 1024
}

func main() {
	fmt.Printf("Initial memory usage: %.2f MB\n", getMemoryUsage())

	// Create first binance exchange
	binance := ccxt.NewBinance(nil)
	fmt.Printf("Memory usage after creating binance: %.2f MB\n", getMemoryUsage())

	// Load markets for first exchange
	marketsChan := binance.LoadMarkets()
	markets := <-marketsChan
	if markets == nil {
		fmt.Println("Failed to load markets for first exchange")
		return
	}
	fmt.Printf("Memory usage after loading markets: %.2f MB\n", getMemoryUsage())

	// Create second binance exchange
	binance2 := ccxt.NewBinance(nil)
	fmt.Printf("Memory usage after creating binance2: %.2f MB\n", getMemoryUsage())

	// Set markets from first exchange to second exchange
	// Convert markets from sync.Map to regular map for SetMarkets
	marketsMap := make(map[string]interface{})
	if marketsSyncMap, ok := markets.(*ccxt.SyncMap); ok {
		marketsSyncMap.Range(func(key, value interface{}) bool {
			if symbol, ok := key.(string); ok {
				marketsMap[symbol] = value
			}
			return true
		})
	}

	binance2.SetMarkets(marketsMap)
	fmt.Printf("Memory usage after setting markets from exchange: %.2f MB\n", getMemoryUsage())
	fmt.Printf("binance2.symbols loaded: %d\n", len(binance2.GetSymbols()))

	// Note: Go doesn't have explicit close methods like Python's async close
	// The garbage collector will handle cleanup
	fmt.Printf("Final memory usage: %.2f MB\n", getMemoryUsage())
}
