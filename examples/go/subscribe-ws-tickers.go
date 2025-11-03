package examples

// This example demonstrates:
// 1. Subscribing to WebSocket ticker streams with consumer functions
// 2. Simulating a network disconnection by closing WebSocket clients
// 3. Using StreamReconnect() to restore connections and resume message flow
// 4. Verifying that consumers continue receiving messages after reconnection
//
// The key insight: StreamReconnect() should be used when connections drop,
// NOT after calling Close(). Close() tears down everything including consumers,
// while disconnecting just the WebSocket clients preserves the Stream state.

import (
	"fmt"
	"log"
	"strings"
	"sync/atomic"
	"time"

	ccxt "github.com/ccxt/ccxt/go/v4"
	ccxtpro "github.com/ccxt/ccxt/go/v4/pro"
)

// contains checks if a string contains a substring
func contains(s, substr string) bool {
	return strings.Contains(s, substr)
}

// Message counters
var (
	messagesBeforeReconnect int64
	messagesAfterReconnect  int64
)

// printMessage prints the ticker message
func printMessage(message *ccxt.Message) error {
	payload, ok := message.Payload.(map[string]interface{})
	if !ok {
		return nil
	}
	symbol := ccxt.SafeString(payload, "symbol", "")
	fmt.Printf("[BEFORE RECONNECT] Received ticker: %s (index: %d)\n", symbol, message.Metadata.Index)
	atomic.AddInt64(&messagesBeforeReconnect, 1)
	return nil
}

// printMessageAfterReconnect prints messages received after reconnection
func printMessageAfterReconnect(message *ccxt.Message) error {
	payload, ok := message.Payload.(map[string]interface{})
	if !ok {
		return nil
	}
	symbol := ccxt.SafeString(payload, "symbol", "")
	count := atomic.AddInt64(&messagesAfterReconnect, 1)
	fmt.Printf("[AFTER RECONNECT] Received ticker #%d: %s (index: %d)\n", count, symbol, message.Metadata.Index)
	return nil
}

// checkForErrors monitors for errors and attempts reconnection
func checkForErrors(exchange *ccxtpro.Binance) func(*ccxt.Message) error {
	return func(message *ccxt.Message) error {
		if message.Error != nil {
			fmt.Printf("Error: %v\n", message.Error)
			// Attempt to reconnect asynchronously
			go func() {
				result := <-exchange.StreamReconnect()
				if ccxt.IsError(result) {
					log.Printf("Failed to reconnect: %v", result)
				}
			}()
		}
		return nil
	}
}

func main() {
	// Create exchange instance
	exchange := ccxtpro.NewBinance(nil)
	// exchange.SetVerbose(true) // Uncomment for detailed logs

	// Initialize the Stream (required before subscribing)
	if exchange.Stream == nil {
		exchange.Stream = ccxt.NewStream(100, true)
	} else {
		exchange.Stream.Init(100, true)
	}

	fmt.Println("Starting WebSocket ticker subscription example...")

	// Load markets first (required for watchTickers)
	fmt.Println("Loading markets...")
	if _, err := exchange.LoadMarkets(false); err != nil {
		log.Fatalf("Failed to load markets: %v", err)
	}
	fmt.Println("Markets loaded successfully")

	// Subscribe to exchange wide errors
	exchange.Stream.Subscribe("errors", checkForErrors(exchange), nil)

	// Use SubscribeTickers to register callbacks AND watch function for reconnection
	stopChan := make(chan bool)
	watchDone := make(chan bool)

	go func() {
		defer close(watchDone)

		// Subscribe synchronously to all tickers with printMessage
		<-exchange.SubscribeTickers(nil, printMessage, nil)

		// Subscribe synchronously to check for errors
		<-exchange.SubscribeTickers(nil, checkForErrors(exchange), nil)

		for {
			select {
			case <-stopChan:
				fmt.Println("Stopping SubscribeTickers goroutine...")
				return
			default:
				// SubscribeTickers with nil callback to register watch function for reconnection
				result := <-exchange.SubscribeTickers(nil, nil, nil)
				if ccxt.IsError(result) {
					log.Printf("Error subscribing tickers: %v", result)
					// Check if it's a connection closed error
					errStr := fmt.Sprintf("%v", result)
					if contains(errStr, "closed network connection") || contains(errStr, "ExchangeClosedByUser") {
						fmt.Println("Connection closed, stopping SubscribeTickers...")
						return
					}
					break
				}
			}
		}
	}()

	// Wait for messages before reconnect test
	fmt.Println("\n=== Phase 1: Collecting messages before reconnect ===")
	time.Sleep(5 * time.Second)

	// Check message count before reconnect
	countBeforeReconnect := atomic.LoadInt64(&messagesBeforeReconnect)
	fmt.Printf("\nMessages received before reconnect: %d\n", countBeforeReconnect)

	// Get history details
	history := exchange.Stream.GetMessageHistory("tickers")
	var lastIndexBeforeReconnect int
	if len(history) > 0 {
		lastIndexBeforeReconnect = history[len(history)-1].Metadata.Index
		fmt.Printf("History buffer size: %d, Last message index: %d\n", len(history), lastIndexBeforeReconnect)
	}

	// Check active watch functions (should be > 0 now)
	if exchange.Stream.ActiveWatchFunctions != nil {
		fmt.Printf("Active watch functions: %d\n", len(exchange.Stream.ActiveWatchFunctions.([]interface{})))
	}

	// Test reconnection by simulating network disconnection
	fmt.Println("\n=== Phase 2: Simulating network disconnection ===")

	// First, stop the watch loop so it doesn't auto-reconnect
	fmt.Println("Stopping watch loop to prevent auto-reconnection...")
	close(stopChan)
	<-watchDone
	fmt.Println("Watch loop stopped")

	// Now close WebSocket clients to simulate network drop
	fmt.Println("\nClosing all WebSocket clients to simulate network failure...")
	exchange.WsClientsMu.Lock()
	clientCount := len(exchange.Clients)
	for url, client := range exchange.Clients {
		fmt.Printf("  Closing WebSocket client: %s\n", url)
		if wsClient, ok := client.(interface{ Close() interface{} }); ok {
			wsClient.Close()
		}
	}
	// Clear clients map to simulate disconnection
	exchange.Clients = make(map[string]interface{})
	exchange.WsClientsMu.Unlock()
	fmt.Printf("Closed %d WebSocket clients\n", clientCount)

	// Wait and verify NO messages are received during downtime
	fmt.Println("\nWaiting 3 seconds (simulating network downtime)...")
	fmt.Println("Verifying no messages are received while disconnected...")
	beforeDisconnectCount := atomic.LoadInt64(&messagesBeforeReconnect)
	time.Sleep(3 * time.Second)
	afterDisconnectCount := atomic.LoadInt64(&messagesBeforeReconnect)

	disconnectDiff := afterDisconnectCount - beforeDisconnectCount
	if disconnectDiff == 0 {
		fmt.Printf("✓ Confirmed: No new messages during disconnect\n")
	} else {
		fmt.Printf("Note: Consumers processed %d buffered messages during disconnect\n", disconnectDiff)
		fmt.Println("(This is expected - consumers process their backlog even when WS is closed)")
	}

	// Subscribe to new consumer that will count messages after reconnect
	// This must be BEFORE StreamReconnect so it's ready when messages start flowing
	fmt.Println("\nSubscribing to new consumer to track post-reconnect messages...")
	exchange.Stream.Subscribe("tickers", printMessageAfterReconnect, nil)

	// Now reconnect - this should re-create all WebSocket connections
	fmt.Println("\n=== Phase 3: Reconnecting after network failure ===")
	fmt.Println("Calling StreamReconnect() to restore connections...")
	result := <-exchange.StreamReconnect()
	if ccxt.IsError(result) {
		log.Fatalf("Reconnection error: %v", result)
	} else {
		fmt.Println("Reconnection successful! WebSocket clients re-created.")
	}

	// Check if watch functions were restored
	if exchange.Stream.ActiveWatchFunctions != nil {
		fmt.Printf("Active watch functions after reconnect: %d\n", len(exchange.Stream.ActiveWatchFunctions.([]interface{})))
	}

	// Check that WebSocket clients were recreated
	exchange.WsClientsMu.Lock()
	newClientCount := len(exchange.Clients)
	exchange.WsClientsMu.Unlock()
	fmt.Printf("WebSocket clients reconnected: %d\n", newClientCount)

	// Wait to receive messages after reconnection
	fmt.Println("\n=== Phase 4: Collecting messages after reconnection ===")
	fmt.Println("Waiting for messages after reconnection...")

	// Wait and check multiple times
	for i := 1; i <= 10; i++ {
		time.Sleep(1 * time.Second)
		count := atomic.LoadInt64(&messagesAfterReconnect)
		if count > 0 {
			fmt.Printf("... %d seconds: %d messages received\n", i, count)
		} else {
			fmt.Printf("... %d seconds: No messages yet\n", i)
		}
	}

	// Final check
	finalCount := atomic.LoadInt64(&messagesAfterReconnect)
	fmt.Printf("\n=== Results ===\n")
	fmt.Printf("Messages before reconnect: %d\n", countBeforeReconnect)
	fmt.Printf("Messages after reconnect: %d\n", finalCount)

	// Verify reconnection worked
	historyAfterReconnect := exchange.Stream.GetMessageHistory("tickers")
	var lastIndexAfterReconnect int
	if len(historyAfterReconnect) > 0 {
		lastIndexAfterReconnect = historyAfterReconnect[len(historyAfterReconnect)-1].Metadata.Index
		fmt.Printf("History buffer size after reconnect: %d, Last message index: %d\n",
			len(historyAfterReconnect), lastIndexAfterReconnect)
	}

	if finalCount > 0 {
		fmt.Printf("\n✓ SUCCESS: Received %d new messages after reconnection!\n", finalCount)
		fmt.Printf("  Index increased from %d to %d (+%d)\n",
			lastIndexBeforeReconnect, lastIndexAfterReconnect, lastIndexAfterReconnect-lastIndexBeforeReconnect)
		fmt.Println("  StreamReconnect() is working correctly!")
	} else {
		fmt.Println("\n✗ FAILED: No new messages received after reconnection")
		fmt.Println("  Diagnosis:")
		indexDiff := lastIndexAfterReconnect - lastIndexBeforeReconnect
		fmt.Printf("  - Messages added to history: %d (index %d -> %d)\n", indexDiff, lastIndexBeforeReconnect, lastIndexAfterReconnect)
		if indexDiff > 0 {
			fmt.Println("  - Watch function IS running (history is updating)")
			fmt.Println("  - But consumer functions are NOT receiving messages")
			fmt.Println("  - BUG: Stream message routing is broken after reconnection")
		} else {
			fmt.Println("  - Watch function is NOT running properly after reconnect")
		}
	}

	// Final cleanup
	fmt.Println("\nClosing exchange...")
	exchange.Close()
	fmt.Println("Example completed!")
}
