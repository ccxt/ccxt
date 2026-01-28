package main

import (
	"fmt"

	binance_sbe "github.com/ccxt/ccxt/go/v4/sbe/binance_spot_3_2"
	okx_sbe "github.com/ccxt/ccxt/go/v4/sbe/okx_1_0"
)

/**
 * Test SBE integration - verify SBE decoders are properly organized and importable
 */

func main() {
	fmt.Println("\n========================================")
	fmt.Println("Go SBE Integration Test")
	fmt.Println("========================================\n")

	testBinanceSbeStructures()
	testOkxSbeStructures()

	fmt.Println("\n========================================")
	fmt.Println("✅ All SBE Integration Tests PASSED!")
	fmt.Println("========================================\n")

	fmt.Println("Summary:")
	fmt.Println("  ✓ Binance SBE decoders are importable")
	fmt.Println("  ✓ OKX SBE decoders are importable")
	fmt.Println("  ✓ SBE package organization is correct")
	fmt.Println("  ✓ Go SBE refactoring successful")
	fmt.Println()
}

func testBinanceSbeStructures() {
	fmt.Println("1. Testing Binance SBE Structures...")

	// Test creating decoder instances
	wsResponse := &binance_sbe.WebSocketResponse{}
	tradesResponse := &binance_sbe.TradesResponse{}
	depthResponse := &binance_sbe.DepthResponse{}
	errorResponse := &binance_sbe.ErrorResponse{}

	fmt.Printf("   ✓ Created WebSocketResponse: %T\n", wsResponse)
	fmt.Printf("   ✓ Created TradesResponse: %T\n", tradesResponse)
	fmt.Printf("   ✓ Created DepthResponse: %T\n", depthResponse)
	fmt.Printf("   ✓ Created ErrorResponse: %T\n", errorResponse)

	// Test that structures have expected fields
	_ = wsResponse.Status
	_ = tradesResponse.Trades
	_ = depthResponse.Bids
	_ = depthResponse.Asks
	_ = errorResponse.Code

	fmt.Println("   ✓ All Binance structures have expected fields")
	fmt.Println()
}

func testOkxSbeStructures() {
	fmt.Println("2. Testing OKX SBE Structures...")

	// Test creating decoder instances
	tradesEvent := &okx_sbe.TradesChannelEvent{}
	booksEvent := &okx_sbe.BooksL2TbtChannelEvent{}
	snapshotEvent := &okx_sbe.SnapshotDepthResponseEvent{}

	fmt.Printf("   ✓ Created TradesChannelEvent: %T\n", tradesEvent)
	fmt.Printf("   ✓ Created BooksL2TbtChannelEvent: %T\n", booksEvent)
	fmt.Printf("   ✓ Created SnapshotDepthResponseEvent: %T\n", snapshotEvent)

	// Test that structures have expected fields
	_ = tradesEvent.InstIdCode
	_ = booksEvent.InstIdCode
	_ = snapshotEvent.InstIdCode

	fmt.Println("   ✓ All OKX structures have expected fields")
	fmt.Println()
}
