package examples

import (
	"fmt"
	"log"
	"time"

	ccxt "github.com/ccxt/ccxt/go/v4"
	ccxtpro "github.com/ccxt/ccxt/go/v4/pro"
)

// printMessage prints the ticker message
func printMessage(message *ccxt.Message) error {
	payload, ok := message.Payload.(map[string]interface{})
	if !ok {
		return nil
	}
	symbol := ccxt.SafeString(payload, "symbol", "")
	last := ccxt.SafeNumber(payload, "last")
	fmt.Printf("Received message from: %s : %s : %v\n", message.Metadata.Topic, symbol, last)
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
	last := ccxt.SafeNumber(payload, "last")
	if last != nil {
		lastFloat, ok := last.(float64)
		if ok && lastFloat > 10000.0 {
			fmt.Printf("Price is over 10000!!!!!!!!!!\n")
			// Note: Unsubscribe requires function reference which is not directly available in Go
			// This is a limitation compared to the TS version
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

// SubscribeWsTickers demonstrates using the Stream Subscribe API with WebSocket tickers
func SubscribeWsTickers() {
	// Create exchange instance
	exchange := ccxtpro.NewBinance(nil)
	exchange.SetVerbose(true)

	fmt.Println("Starting WebSocket ticker subscription example...")

	// Subscribe synchronously to all tickers with a sync function
	exchange.Stream.Subscribe("tickers", printMessage, nil)

	// Subscribe synchronously to check for errors
	exchange.Stream.Subscribe("tickers", checkForErrors(exchange), nil)

	// Subscribe asynchronously to all tickers with price alert
	exchange.Stream.Subscribe("tickers", priceAlert, map[string]interface{}{
		"synchronous": false,
	})

	// Subscribe synchronously to a single ticker with an async function
	exchange.Stream.Subscribe("tickers::BTC/USDT", storeInDb, nil)

	// Subscribe to exchange wide errors
	exchange.Stream.Subscribe("errors", checkForErrors(exchange), nil)

	// Create ws subscriptions using WatchTickers in a goroutine
	go func() {
		for {
			_, err := exchange.WatchTickers(nil)
			if err != nil {
				log.Printf("Error watching tickers: %v", err)
				break
			}
		}
	}()

	// Wait for messages
	time.Sleep(5 * time.Second)

	// Get history length
	history := exchange.Stream.GetMessageHistory("tickers")
	fmt.Printf("History Length: %d\n", len(history))

	// Close the exchange
	fmt.Println("Closing exchange...")
	errs := exchange.Close()
	if len(errs) > 0 {
		log.Printf("Errors during close: %v", errs)
	}

	// Test reconnection
	fmt.Println("Testing reconnection...")
	result := <-exchange.StreamReconnect()
	if ccxt.IsError(result) {
		log.Printf("Reconnection error: %v", result)
	}

	time.Sleep(5 * time.Second)

	fmt.Println("Example completed!")
}
