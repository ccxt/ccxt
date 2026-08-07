package prediction

// Polymarket end-to-end example (read market data + place/fetch/cancel one order).
//
// Flow:
//   1. pick a high-volume event, a market inside it, and an outcome with a live two-sided book
//   2. fetch the order book, ticker and recent trades for that outcome
//   3. place a resting limit BUY well below the book, fetch it back, then cancel it
//
// Usage:
//   POLYMARKET_PRIVATEKEY=... POLYMARKET_WALLETADDRESS=0x... go run .
//
// walletAddress is the polymarket account wallet (the proxy / deposit wallet shown in
// your polymarket profile), privateKey is the key of the EOA that owns it.

import (
	"fmt"
	"math"
	"os"

	ccxt "github.com/ccxt/ccxt/go/v4"
	ccxtprediction "github.com/ccxt/ccxt/go/v4/prediction"
)

const maxNotionalUsd = 25.0 // hard cap per trade
const orderSizeShares = 5.0 // polymarket minimum order size

func PolymarketEndToEndExample() {
	privateKey := os.Getenv("POLYMARKET_PRIVATEKEY")
	walletAddress := os.Getenv("POLYMARKET_WALLETADDRESS")
	if privateKey == "" || walletAddress == "" {
		fmt.Println("Set POLYMARKET_PRIVATEKEY and POLYMARKET_WALLETADDRESS env vars first.")
		return
	}
	exchange := ccxtprediction.NewPolymarket(map[string]any{
		"privateKey":    privateKey,
		"walletAddress": walletAddress,
	})

	// 1) pick a high-volume event and an outcome with a live two-sided book ----------------
	// FetchEvents requires a scope (query/queries/tags/eventId/slug); sort/limit apply within it
	events, err := exchange.FetchEvents(map[string]interface{}{"query": "fed", "sort": "volume", "limit": 15})
	if err != nil {
		fmt.Println("fetchEvents failed:", err)
		return
	}
	var symbol string
	var book ccxt.PredictionOrderBook
	tick := 0.01
	probes := 0
	for _, event := range events {
		for _, market := range event.Markets {
			for _, outcome := range market.Outcomes {
				if probes >= 20 || outcome.Outcome == nil {
					break
				}
				probes += 1
				candidateBook, obErr := exchange.FetchOrderBook(*outcome.Outcome)
				if obErr != nil {
					continue
				}
				if len(candidateBook.Bids) > 0 && len(candidateBook.Asks) > 0 {
					symbol = *outcome.Outcome
					book = candidateBook
					if outcome.Precision != nil && outcome.Precision.Price != nil {
						tick = *outcome.Precision.Price
					}
					if event.Title != nil {
						fmt.Println("event:   ", *event.Title)
					}
					label := ""
					if outcome.Label != nil {
						label = *outcome.Label
					}
					fmt.Println("outcome: ", symbol, "("+label+")")
					break
				}
			}
			if symbol != "" {
				break
			}
		}
		if symbol != "" {
			break
		}
	}
	if symbol == "" {
		fmt.Println("Could not find an outcome with a live two-sided order book right now.")
		return
	}

	// 2) market data for the chosen outcome -------------------------------------------------
	bestBid := book.Bids[0]
	bestAsk := book.Asks[0]
	fmt.Println("\n--- market data ---")
	fmt.Println("orderbook bid/ask:", bestBid, "/", bestAsk)
	if ticker, tErr := exchange.FetchTicker(symbol); tErr == nil {
		fmt.Println("ticker bid/ask/last:", *ticker.Bid, "/", *ticker.Ask, "/", *ticker.Last)
	} else {
		fmt.Println("ticker:        n/a:", tErr)
	}
	if trades, trErr := exchange.FetchTrades(symbol, ccxt.WithFetchTradesLimit(3)); trErr == nil {
		last := ""
		if len(trades) > 0 && trades[0].Price != nil {
			last = fmt.Sprintf("last @ %v", *trades[0].Price)
		}
		fmt.Println("recent trades:", len(trades), last)
	} else {
		fmt.Println("trades:        n/a:", trErr)
	}

	// 3) place a resting limit BUY well below the book, fetch it, then cancel ----------------
	bidPrice := bestBid[0]
	// half the best bid, floored to the tick — far below the ask, so it cannot fill
	price := math.Floor((bidPrice*0.5)/tick) * tick
	price = math.Max(tick, math.Round(price*10000)/10000)
	notional := orderSizeShares * price
	fmt.Println("\n--- order ---")
	fmt.Println("placing limit BUY", orderSizeShares, "shares @", price, "(notional", math.Round(notional*100)/100, "USD)")
	if notional >= maxNotionalUsd {
		fmt.Println("ABORT: notional >=", maxNotionalUsd, "USD safety cap.")
		return
	}

	order, err := exchange.CreateOrder(symbol, "limit", "buy", orderSizeShares, ccxt.WithCreateOrderPrice(price))
	if err != nil {
		fmt.Println("createOrder failed:", err)
		return
	}
	fmt.Println("placed:  id", *order.Id, "| status", *order.Status)
	// always cancel the resting order, even if the fetch in between fails
	defer func() {
		canceled, cErr := exchange.CancelOrder(*order.Id, ccxtprediction.WithCancelOrderOutcome(symbol))
		if cErr != nil {
			fmt.Println("CANCEL FAILED — cancel manually! id", *order.Id, cErr)
			return
		}
		fmt.Println("canceled: id", *canceled.Id, "| status", *canceled.Status)
	}()
	fetched, fErr := exchange.FetchOrder(*order.Id, ccxtprediction.WithFetchOrderOutcome(symbol))
	if fErr != nil {
		fmt.Println("fetchOrder failed:", fErr)
		return
	}
	fmt.Println("fetched: id", *fetched.Id, "| status", *fetched.Status, "| remaining", *fetched.Remaining)
}
