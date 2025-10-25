package examples

import (
	"fmt"
	"log"
	"strings"
	"time"

	ccxt "github.com/ccxt/ccxt/go/v4"
	ccxtpro "github.com/ccxt/ccxt/go/v4/pro"
)

// contains checks if a string contains a substring
func contains(s, substr string) bool {
	return strings.Contains(s, substr)
}

// printMessage prints the ticker message
func printMessage(message *ccxt.Message) error {
	payload, ok := message.Payload.(map[string]interface{})
	if !ok {
		return nil
	}
	symbol := ccxt.SafeString(payload, "symbol", "")
	fmt.Printf("Received message from: %s : %s : %v\n", message.Metadata.Topic, symbol, payload)
	return nil
}

// storeInDb simulates storing data in a database
func storeInDb(message *ccxt.Message) error {
	time.Sleep(1 * time.Second)
	fmt.Printf("stored in DB index: %d\n", message.Metadata.Index)
	return nil
}

// priceAlert checks if price is over threshold
func priceAlert(message *ccxt.Message) error {
	payload, ok := message.Payload.(map[string]interface{})
	if !ok {
		return nil
	}
	last := ccxt.SafeFloat(payload, "last", nil)
	if last != nil {
		lastFloat, ok := last.(float64)
		if ok && lastFloat > 10000.0 {
			fmt.Printf("Price is over 10000!!!!!!!!!!\n")
		}
	}
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

	// Subscribe synchronously to a single ticker with an async function
	exchange.Stream.Subscribe("tickers::BTC/USDT", storeInDb, nil)

	// Use SubscribeTickers to register callbacks AND watch function for reconnection
	stopChan := make(chan bool)
	watchDone := make(chan bool)

	go func() {
		defer close(watchDone)

		// Subscribe synchronously to all tickers - SubscribeTickers registers the watch function
		<-exchange.SubscribeTickers(nil, printMessage, nil)

		// Subscribe synchronously to check for errors
		<-exchange.SubscribeTickers(nil, checkForErrors(exchange), nil)

		// Subscribe asynchronously to all tickers with price alert
		<-exchange.SubscribeTickers(nil, priceAlert, map[string]interface{}{
			"synchronous": false,
		})

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

	// Wait for messages
	time.Sleep(5 * time.Second)

	// Get history length and last message index
	history := exchange.Stream.GetMessageHistory("tickers")
	var lastIndexBeforeClose int
	if len(history) > 0 {
		lastIndexBeforeClose = history[len(history)-1].Metadata.Index
	}
	fmt.Printf("History Length: %d, Last Index: %d\n", len(history), lastIndexBeforeClose)

	// Check active watch functions (should be > 0 now)
	if exchange.Stream.ActiveWatchFunctions != nil {
		fmt.Printf("Active watch functions before close: %d\n", len(exchange.Stream.ActiveWatchFunctions.([]interface{})))
	}

	// Signal the goroutine to stop before closing
	fmt.Println("Signaling SubscribeTickers to stop...")
	close(stopChan)

	// Wait for the goroutine to finish
	<-watchDone
	fmt.Println("SubscribeTickers stopped")

	// Close the exchange
	fmt.Println("Closing exchange...")
	errs := exchange.Close()
	if len(errs) > 0 {
		log.Printf("Errors during close: %v", errs)
	}

	// Wait a bit to ensure everything is closed
	time.Sleep(1 * time.Second)

	// Check active watch functions before reconnect
	if exchange.Stream.ActiveWatchFunctions != nil {
		fmt.Printf("Active watch functions before reconnect: %d\n", len(exchange.Stream.ActiveWatchFunctions.([]interface{})))
	}

	// Test reconnection - should automatically resume subscriptions
	fmt.Println("Testing reconnection...")

	result := <-exchange.StreamReconnect()
	if ccxt.IsError(result) {
		log.Printf("Reconnection error: %v", result)
	} else {
		fmt.Println("Reconnection successful!")
	}

	// Wait to receive messages after reconnection
	// StreamReconnect should automatically resume all registered watch functions
	fmt.Println("Waiting for messages after reconnection...")
	time.Sleep(10 * time.Second)

	// Check history to verify messages were received
	historyAfterReconnect := exchange.Stream.GetMessageHistory("tickers")
	var lastIndexAfterReconnect int
	if len(historyAfterReconnect) > 0 {
		lastIndexAfterReconnect = historyAfterReconnect[len(historyAfterReconnect)-1].Metadata.Index
	}
	fmt.Printf("History Length after reconnect: %d (previous was %d)\n", len(historyAfterReconnect), len(history))
	fmt.Printf("Last Index after reconnect: %d (previous was %d)\n", lastIndexAfterReconnect, lastIndexBeforeClose)

	if lastIndexAfterReconnect > lastIndexBeforeClose {
		fmt.Printf("SUCCESS: Received new messages after reconnection! (+%d messages)\n", lastIndexAfterReconnect-lastIndexBeforeClose)
	} else {
		fmt.Println("WARNING: No new messages received after reconnection")
	}

	fmt.Println("Example completed!")
}
