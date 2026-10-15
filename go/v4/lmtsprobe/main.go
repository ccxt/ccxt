package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	ccxtprediction "github.com/ccxt/ccxt/go/v4/prediction"
)

func report(label string, n int, err error) {
	if err != nil {
		msg := err.Error()
		reached := strings.Contains(msg, "not found") || strings.Contains(msg, "OrderNotFound") || strings.Contains(msg, "already canceled")
		tag := "FAIL  "
		if reached {
			tag = "PASS* "
		}
		if len(msg) > 90 {
			msg = msg[:90]
		}
		fmt.Println(tag + label + "  -> " + msg)
	} else {
		fmt.Printf("PASS  %s  -> %d item(s)\n", label, n)
	}
}

func run(label string, fn func() (int, error)) {
	defer func() {
		if r := recover(); r != nil {
			report(label, 0, fmt.Errorf("%v", r))
		}
	}()
	n, err := fn()
	report(label, n, err)
}

func main() {
	raw, _ := os.ReadFile("/Users/pablo/github/ccxt.git.prediction/keys.local.json")
	var all map[string]map[string]any
	json.Unmarshal(raw, &all)
	k := all["limitless"]
	cfg := map[string]any{"apiKey": k["apiKey"], "secret": k["secret"]}
	if v, ok := k["walletAddress"]; ok {
		cfg["walletAddress"] = v
	}
	ex := ccxtprediction.NewLimitless(cfg)
	markets, _ := ex.LoadMarkets()
	var outcome, slug string
	for _, m := range markets {
		info := m.Info
		if info == nil || m.Symbol == nil {
			continue
		}
		venue, _ := info["venue"].(map[string]any)
		if venue == nil {
			continue
		}
		if _, ok := venue["exchange"].(string); !ok {
			continue
		}
		s, _ := info["slug"].(string)
		if s == "" {
			continue
		}
		slug = s
		outcome = *m.Symbol + ":YES"
		break
	}
	fmt.Println("using outcome " + outcome + " slug " + slug + "\n")
	fake := "11111111-1111-4111-8111-111111111111"
	run("fetchAccounts", func() (int, error) { r, e := ex.FetchAccounts(); return len(r), e })
	run("fetchPositions", func() (int, error) { r, e := ex.FetchPositions(); return len(r), e })
	run("fetchMyTrades (all)", func() (int, error) { r, e := ex.FetchMyTrades(); return len(r), e })
	run("fetchMyTrades (outcome)", func() (int, error) {
		r, e := ex.FetchMyTrades(ccxtprediction.WithFetchMyTradesOutcome(outcome))
		return len(r), e
	})
	run("fetchOrders (outcome)", func() (int, error) {
		r, e := ex.FetchOrders(ccxtprediction.WithFetchOrdersOutcome(outcome))
		return len(r), e
	})
	run("fetchOpenOrders (outcome)", func() (int, error) {
		r, e := ex.FetchOpenOrders(ccxtprediction.WithFetchOpenOrdersOutcome(outcome))
		return len(r), e
	})
	run("fetchOrder (fake id)", func() (int, error) {
		_, e := ex.FetchOrder(fake, ccxtprediction.WithFetchOrderOutcome(outcome))
		return 1, e
	})
	run("fetchOrdersByIds (fake id)", func() (int, error) {
		r, e := ex.FetchOrdersByIds([]string{fake}, ccxtprediction.WithFetchOrdersByIdsOutcome(outcome))
		return len(r), e
	})
	run("cancelOrder (fake id)", func() (int, error) {
		_, e := ex.CancelOrder(fake, ccxtprediction.WithCancelOrderOutcome(outcome))
		return 1, e
	})
	run("cancelOrders (fake id)", func() (int, error) {
		r, e := ex.CancelOrders([]string{fake})
		return len(r), e
	})
	run("cancelAllOrders (slug, no-op)", func() (int, error) {
		r, e := ex.CancelAllOrders(ccxtprediction.WithCancelAllOrdersParams(map[string]any{"slug": slug, "warnOnCancelAllOrdersWithOutcome": false}))
		return len(r), e
	})
}
