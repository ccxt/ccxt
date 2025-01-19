
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"runtime"
	"runtime/pprof"
	"sync"
	"time"

	_ "net/http/pprof"

	"ccxt/go/ccxt"
)

func printMemStats(label string) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	fmt.Printf("\n=== %s ===\n", label)
	fmt.Printf("Alloc = %v MiB\n", bToMb(m.Alloc))
	fmt.Printf("TotalAlloc = %v MiB\n", bToMb(m.TotalAlloc))
	fmt.Printf("Sys = %v MiB\n", bToMb(m.Sys))
	fmt.Printf("NumGC = %v\n", m.NumGC)
}

func bToMb(b uint64) uint64 {
	return b / 1024 / 1024
}

func main() {
	// CPU Profiling
	cpuFile, err := os.Create("cpu.prof")
	if err != nil {
		fmt.Printf("Could not create CPU profile: %v\n", err)
		return
	}
	defer cpuFile.Close()

	if err := pprof.StartCPUProfile(cpuFile); err != nil {
		fmt.Printf("Could not start CPU profile: %v\n", err)
		return
	}
	defer pprof.StopCPUProfile()

	// Setup runtime memory profiling
	runtime.MemProfileRate = 1

	// Create memory profile file
	memFile, err := os.Create("mem.prof")
	if err != nil {
		fmt.Printf("Could not create memory profile: %v\n", err)
		return
	}
	defer memFile.Close()

	// Add multiple memory profile captures
	captureMemProfile := func(label string) {
		runtime.GC() // Force GC to get accurate memory stats
		if err := pprof.WriteHeapProfile(memFile); err != nil {
			fmt.Printf("Could not write memory profile (%s): %v\n", label, err)
		}
	}

	// Capture initial state
	captureMemProfile("initial")

	// Add runtime/pprof debug server
	go func() {
		fmt.Println("Starting pprof server on :6060")
		log.Println(http.ListenAndServe("localhost:6060", nil))
	}()

	const numRuns = 5

	// Print initial memory stats
	printMemStats("Initial State")

	// Create exchange
	binance := ccxt.NewBinance(map[string]interface{}{
		"verbose": false,
	})

	// Load markets and get symbols
	<-binance.LoadMarkets()
	symbols := binance.Symbols
	if len(symbols) > 500 {
		symbols = symbols[:500]
	}

	// Add validation
	if len(symbols) == 0 {
		fmt.Println("Error: No symbols loaded from exchange")
		return
	}

	fmt.Printf("\nTotal symbols to process: %d\n", len(symbols))

	// Track aggregate statistics
	var totalDuration time.Duration
	var totalSuccess, totalFailed int

	// Run test 10 times
	for run := 0; run < numRuns; run++ {
		fmt.Printf("\n=== Run %d/%d ===\n", run+1, numRuns)

		// Print memory before run
		printMemStats(fmt.Sprintf("Before Run %d", run+1))

		start := time.Now()

		// Create channels for results
		type OrderBookResult struct {
			Symbol    string
			OrderBook interface{}
			Error     error
		}
		results := make(chan OrderBookResult, len(symbols))

		// Use WaitGroup to track goroutines
		var wg sync.WaitGroup

		// Track number of active goroutines
		fmt.Printf("Goroutines before fetch: %d\n", runtime.NumGoroutine())

		// Fetch order books concurrently
		for _, symbol := range symbols {
			wg.Add(1)
			go func(sym string) {
				defer wg.Done()
				orderBook, err := binance.FetchOrderBook(sym)
				results <- OrderBookResult{
					Symbol:    sym,
					OrderBook: orderBook,
					Error:     err,
				}
			}(symbol)
		}

		// Close results channel when all goroutines complete
		go func() {
			wg.Wait()
			close(results)
		}()

		// Process results and track statistics
		var success, failed int

		for result := range results {
			if result.Error != nil {
				failed++
				// fmt.Printf("Error fetching %s: %v\n", result.Symbol, result.Error)
			} else {
				success++
			}
		}

		duration := time.Since(start)
		totalDuration += duration
		totalSuccess += success
		totalFailed += failed

		// Print run statistics
		fmt.Printf("\n=== Run %d Results ===\n", run+1)
		fmt.Printf("Successful: %d\n", success)
		fmt.Printf("Failed: %d\n", failed)
		fmt.Printf("Duration: %v\n", duration)

		// Add check for zero symbols
		if len(symbols) > 0 {
			fmt.Printf("Average time per symbol: %v\n", duration/time.Duration(len(symbols)))
		} else {
			fmt.Printf("No symbols processed\n")
		}

		fmt.Printf("Goroutines after fetch: %d\n", runtime.NumGoroutine())

		// Print memory after run
		printMemStats(fmt.Sprintf("After Run %d", run+1))

		// Capture memory profile after each run
		captureMemProfile(fmt.Sprintf("run-%d", run))

		runtime.GC()
	}

	// Final memory profile
	captureMemProfile("final")

	// Print aggregate statistics
	fmt.Printf("\n=== Aggregate Results (%d runs) ===\n", numRuns)
	fmt.Printf("Average Duration: %v\n", totalDuration/numRuns)
	fmt.Printf("Average Success Rate: %.2f%%\n", float64(totalSuccess)/float64(totalSuccess+totalFailed)*100)
	fmt.Printf("Total Successful: %d\n", totalSuccess)
	fmt.Printf("Total Failed: %d\n", totalFailed)

	// Final memory stats
	printMemStats("Final State")
}
