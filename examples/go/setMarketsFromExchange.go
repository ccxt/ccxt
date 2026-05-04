package examples

import (
	"ccxt/go/ccxt"
	"fmt"
	"runtime"
	"runtime/debug"
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
	markets, err := binance.LoadMarkets()
	if err != nil {
		fmt.Printf("Failed to load markets for first exchange: %v\n", err)
		return
	}
	if markets == nil {
		fmt.Println("Failed to load markets for first exchange")
		return
	}
	fmt.Printf("Memory usage after loading markets: %.2f MB\n", getMemoryUsage())

	// Create second binance exchange
	binance2 := ccxt.NewBinance(nil)
	fmt.Printf("Memory usage after creating binance2: %.2f MB\n", getMemoryUsage())

	binance2.SetMarketsFromExchange(&binance.Exchange)
	fmt.Printf("Memory usage after setting markets from exchange: %.2f MB\n", getMemoryUsage())
	fmt.Printf("binance2.symbols loaded: %d\n", len(binance2.GetSymbols()))

	// Note: Go doesn't have explicit close methods like Python's async close
	// The garbage collector will handle cleanup
	fmt.Printf("Final memory usage: %.2f MB\n", getMemoryUsage())
}
