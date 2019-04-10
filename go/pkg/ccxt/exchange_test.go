package ccxt

import (
	"testing"
	"time"

	"github.com/ccxt/ccxt/go/internal/util"
)

var x Exchange

func init() {
	x = Exchange{}
}

func skipAuthError(t *testing.T, err error) {
	if _, ok := err.(AuthenticationError); ok {
		t.Skip(err)
	}
}

func skipNotSupportedError(t *testing.T, err error) {
	if _, ok := err.(NotSupportedError); ok {
		t.Skip(err)
	}
}

func getAnyMarket(t *testing.T) (m Market) {
	markets, err := x.LoadMarkets(false)
	if err != nil {
		t.Fatal("LoadMarkets: ", err)
	}
	for _, v := range markets {
		return v
	}
	t.Fatalf("%s: no markets available", x.Info().Name)
	return
}

func TestLoadMarkets(t *testing.T) {
	markets, err := x.LoadMarkets(false)
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("%d markets available\n", len(markets))
}

func TestFetchOpenOrders(t *testing.T) {
	m := getAnyMarket(t)
	openOrders, err := x.FetchOpenOrders(&m.Symbol, nil, nil, nil)
	if err != nil {
		skipAuthError(t, err)
		skipNotSupportedError(t, err)
		t.Fatal(err)
	}
	t.Logf("%s: %d open orders\n", m.Symbol, len(openOrders))
}

func TestFetchClosedOrders(t *testing.T) {
	m := getAnyMarket(t)
	orders, err := x.FetchClosedOrders(&m.Symbol, nil, nil, nil)
	if err != nil {
		skipAuthError(t, err)
		skipNotSupportedError(t, err)
		t.Fatal(err)
	}
	t.Logf("%s: %d closed orders", m.Symbol, len(orders))
}

func TestFetchOrders(t *testing.T) {
	m := getAnyMarket(t)
	orders, err := x.FetchOrders(&m.Symbol, nil, nil, nil)
	if err != nil {
		skipAuthError(t, err)
		skipNotSupportedError(t, err)
		t.Fatal(err)
	}
	t.Logf("%s: %d orders", m.Symbol, len(orders))
}

func TestFetchTickers(t *testing.T) {
	tickers, err := x.FetchTickers(nil, nil)
	if err != nil {
		skipNotSupportedError(t, err)
		t.Fatal(err)
	}
	t.Logf("%d tickers\n", len(tickers))
}

func TestFetchTicker(t *testing.T) {
	m := getAnyMarket(t)
	ticker, err := x.FetchTicker(m.Symbol, nil)
	if err != nil {
		skipNotSupportedError(t, err)
		t.Fatal(err)
	}
	t.Logf("%s (%.2f%%): %f / %f\n", ticker.Symbol, ticker.Change, ticker.Ask, ticker.Bid)
}

func TestFetchOHLCV(t *testing.T) {
	m := getAnyMarket(t)
	info := x.Info()
	if !info.Has["fetchOHLCV"] {
		t.Skip("NotSupported: fetchOHLCV")
	}
	var tf string
	for k := range info.Timeframes {
		tf = k
	}
	if tf == "" {
		t.Fatalf("%s: no timeframe available", info.Name)
	}
	candles, err := x.FetchOHLCV(m.Symbol, tf, nil, nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	if len(candles) == 0 {
		t.Fatalf("%s: fetched 0 candles", m.Symbol)
	}
	t.Logf("%s: %d candles for tf %s - from %s to %s",
		m.Symbol, len(candles), tf, candles[0].Timestamp, candles[len(candles)-1].Timestamp)
}

func TestFetchOrderBook(t *testing.T) {
	m := getAnyMarket(t)
	book, err := x.FetchOrderBook(m.Symbol, nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("%s: %d asks / %d bids\n", m.Symbol, len(book.Asks), len(book.Bids))
}

func TestFetchTrades(t *testing.T) {
	m := getAnyMarket(t)
	trades, err := x.FetchTrades(m.Symbol, util.Time(time.Now().Add(-time.Minute)), nil)
	if err != nil {
		skipNotSupportedError(t, err)
		t.Fatal(err)
	}
	t.Logf("%s: %d trades the last minute", m.Symbol, len(trades))
}

func TestFetchBalance(t *testing.T) {
	b, err := x.FetchBalance(nil)
	if err != nil {
		skipAuthError(t, err)
		t.Fatal(err)
	}
	b.FilterZeros()
	t.Logf("balance totals: %v", b.Total)
}

func TestOrdersBasics(t *testing.T) {
	markets, err := x.LoadMarkets(false)
	if err != nil {
		t.Fatal(err)
	}
	if len(markets) == 0 {
		t.Fatal("no markets available")
	}
	balances, err := x.FetchBalance(nil)
	if err != nil {
		skipAuthError(t, err)
		t.Fatal(err)
	}
	balances.FilterZeros()

	var market Market
	var free float64
	for _, v := range markets {
		if free = balances.Free[v.Base]; free > v.Limits.Amount.Min {
			market = v
			break
		}
	}

	if market.Symbol == "" {
		t.Skipf("no ca$h available for placing test order")
	}
	t.Logf("market %s", market.Symbol)

	book, err := x.FetchOrderBook(market.Symbol, nil, nil)
	if err != nil {
		t.Fatalf("couldn't fetch order book for %s:%s: %s", market.Symbol, err)
	}
	if len(book.Asks) == 0 {
		t.Fatalf("empty book.Asks")
	}

	// setup order for 10% of available balance @10*highest ask
	ask := book.Asks[len(book.Asks)-1].Price * 10
	amount := free * 0.1

	// place our optimistic ask
	order, err := x.CreateOrder(market.Symbol, "limit", "sell", amount, &ask, nil)
	if err != nil {
		t.Fatal("CreateOrder: ", err)
	}
	t.Logf("created order %s: %s", order.ID, order)

	// look for it in our orders
	myOrders, err := x.FetchOrders(&market.Symbol, nil, nil, nil)
	if err != nil {
		t.Errorf("FetchOrders: %s", err)
	} else {
		var found bool
		for _, o := range myOrders {
			if o.ID == order.ID {
				found = true
				if o.String() != order.String() {
					t.Errorf(
						"found order ID from FetchOrders but mismatch on .String methods:\n  %s\n  %s",
						o.String(), order.String())
				}
			}
		}
		if !found {
			t.Errorf("didn't find created order %s from FetchOrders", order.ID)
		}
	}

	if o, err := x.FetchOrder(order.ID, nil, nil); err != nil {
		t.Error("FetchOrder: ", err)
	} else if o.ID != order.ID {
		t.Errorf("FetchOrder: unexpected order ID : %s vs %s", o.ID, order.ID)
	} else if o.String() != order.String() {
		t.Errorf("found order ID but mismatch on .String methods:\n  %s\n  %s",
			o.String(), order.String())
	}

	// cancel it
	for i := 0; i < 5; i++ {
		err = x.CancelOrder(order.ID, &market.Symbol, nil)
		if err == nil {
			t.Logf("canceled order %s", order.ID)
			break
		}
		if err != nil {
			t.Error("CancelOrder: ", err)
		}
		time.Sleep(time.Second * 5)
		i++
		t.Fatalf("Couldn't cancel order %s on %s after 5 tries, do something human",
			order.ID, order.Symbol)
	}
}
