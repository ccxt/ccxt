// OrderRouter — ask the router how to convert one asset into another.
//
// The router holds live L2 books from many venues and answers "what is the
// cheapest way to turn X into Y right now, and on which venues" — book-walked
// to your actual size, fee-adjusted, and split across venues when that beats
// any single one.
//
// This example is READ-ONLY: it asks for a recommendation and prints it. It
// never places an order. Execution lives behind router.Execute(plan, venues),
// which defaults to dry_run and refuses to trade unless explicitly told to.
//
// Usage:
//
//	ORDER_ROUTER_API_KEY=or_live_... go run .
//
// Get a key from https://docs.ccxt.com/router
package main

import (
	"fmt"
	"os"

	ccxt "github.com/ccxt/ccxt/go/v4"
)

func main() {
	apiKey := os.Getenv("ORDER_ROUTER_API_KEY")
	if apiKey == "" {
		fmt.Println("set ORDER_ROUTER_API_KEY (get one at https://docs.ccxt.com/router)")
		return
	}

	router, err := ccxt.NewOrderRouter(map[string]any{
		"apiKey": apiKey,
		// "baseUrl": "https://docs.ccxt.com/router/api",  // the default
	})
	if err != nil {
		fmt.Println(err)
		return
	}

	// Exactly one of amountIn or amountOut — never both, and never neither.
	// They are different book traversals, not a unit conversion: amountIn walks
	// until the money runs out, amountOut walks until the size is reached.
	route, err := router.FetchRoute("USDT", "BTC", map[string]any{
		"amountIn": 20,
		"strategy": "split_optimal",
	})
	if err != nil {
		fmt.Println(err)
		return
	}

	// An unroutable pair comes back as a result with a reason, NOT an error.
	// Refusing to quote is a deliberate outcome, not a failure.
	if reason, ok := route["unroutableReason"]; ok && reason != nil {
		fmt.Println("unroutable:", reason)
		return
	}

	fmt.Println(route["amountIn"], route["from"], "->", route["amountOut"], route["to"])
	fmt.Println("effective rate  ", route["effectiveRate"])
	fmt.Println("price impact    ", route["impactBps"], "bps") // positive is worse
	fmt.Println("fill ratio      ", route["fillRatio"])

	// One hop is a direct conversion; more than one means it was bridged
	// (e.g. SOL -> USDT -> BTC), and each hop is a separate order.
	hops, _ := route["hops"].([]any)
	for i, hopAny := range hops {
		hop, _ := hopAny.(map[string]any)
		legs, _ := hop["legs"].([]any)
		fmt.Println("hop", i+1, hop["pair"], hop["side"], "-", len(legs), "venue(s)")
		for _, legAny := range legs {
			leg, _ := legAny.(map[string]any)
			fmt.Println("   ", leg["exchangeId"], leg["amount"], "@", leg["effectivePrice"])
		}
	}
}
