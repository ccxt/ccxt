package ccxttest

import (
	"github.com/ccxt/ccxt/go"
	"github.com/ccxt/ccxt/go/util"
	"testing"
	"time"
)

func TestExchange(t *testing.T, x ccxt.Exchange) {
	t.Run("LoadMarkets", func(t *testing.T) { testLoadMarkets(t, x) })
	t.Run("FetchOpenOrders", func(t *testing.T) { testFetchOpenOrders(t, x) })
	t.Run("FetchClosedOrders", func(t *testing.T) { testFetchClosedOrders(t, x) })
	t.Run("FetchOrders", func(t *testing.T) { testFetchOrders(t, x) })
	t.Run("FetchTickers", func(t *testing.T) { testFetchTickers(t, x) })
	t.Run("FetchTicker", func(t *testing.T) { testFetchTicker(t, x) })
	t.Run("FetchOHLCV", func(t *testing.T) { testFetchOHLCV(t, x) })
	t.Run("FetchOrderBook", func(t *testing.T) { testFetchOrderBook(t, x) })
	t.Run("FetchTrades", func(t *testing.T) { testFetchTrades(t, x) })
	t.Run("FetchBalance", func(t *testing.T) { testFetchBalance(t, x) })
	t.Run("OrdersBasics", func(t *testing.T) { testOrdersBasics(t, x) })
}

func skipAuthError(t *testing.T, err error) {
	if _, ok := err.(ccxt.AuthenticationError); ok {
		t.Skip(err)
	}
}

func skipNotSupportedError(t *testing.T, err error) {
	if _, ok := err.(ccxt.NotSupportedError); ok {
		t.Skip(err)
	}
}

func getAnyMarket(t *testing.T, x ccxt.Exchange) (m ccxt.Market) {
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

func testLoadMarkets(t *testing.T, x ccxt.Exchange) {
	markets, err := x.LoadMarkets(false)
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("%d markets available\n", len(markets))
}

func testFetchOpenOrders(t *testing.T, x ccxt.Exchange) {
	m := getAnyMarket(t, x)
	openOrders, err := x.FetchOpenOrders(&m.Symbol, nil, nil, nil)
	if err != nil {
		skipAuthError(t, err)
		skipNotSupportedError(t, err)
		t.Fatal(err)
	}
	t.Logf("%s: %d open orders\n", m.Symbol, len(openOrders))
}

func testFetchClosedOrders(t *testing.T, x ccxt.Exchange) {
	m := getAnyMarket(t, x)
	orders, err := x.FetchClosedOrders(&m.Symbol, nil, nil, nil)
	if err != nil {
		skipAuthError(t, err)
		skipNotSupportedError(t, err)
		t.Fatal(err)
	}
	t.Logf("%s: %d closed orders", m.Symbol, len(orders))
}

func testFetchOrders(t *testing.T, x ccxt.Exchange) {
	m := getAnyMarket(t, x)
	orders, err := x.FetchOrders(&m.Symbol, nil, nil, nil)
	if err != nil {
		skipAuthError(t, err)
		skipNotSupportedError(t, err)
		t.Fatal(err)
	}
	t.Logf("%s: %d orders", m.Symbol, len(orders))
}

func testFetchTickers(t *testing.T, x ccxt.Exchange) {
	tickers, err := x.FetchTickers(nil, nil)
	if err != nil {
		skipNotSupportedError(t, err)
		t.Fatal(err)
	}
	t.Logf("%d tickers\n", len(tickers))
}

func testFetchTicker(t *testing.T, x ccxt.Exchange) {
	m := getAnyMarket(t, x)
	ticker, err := x.FetchTicker(m.Symbol, nil)
	if err != nil {
		skipNotSupportedError(t, err)
		t.Fatal(err)
	}
	t.Logf("%s (%.2f%%): %f / %f\n", ticker.Symbol, ticker.Change, ticker.Ask, ticker.Bid)
}

func testFetchOHLCV(t *testing.T, x ccxt.Exchange) {
	m := getAnyMarket(t, x)
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

func testFetchOrderBook(t *testing.T, x ccxt.Exchange) {
	m := getAnyMarket(t, x)
	book, err := x.FetchOrderBook(m.Symbol, nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("%s: %d asks / %d bids\n", m.Symbol, len(book.Asks), len(book.Bids))
}

func testFetchTrades(t *testing.T, x ccxt.Exchange) {
	m := getAnyMarket(t, x)
	trades, err := x.FetchTrades(m.Symbol, util.Time(time.Now().Add(-time.Minute)), nil)
	if err != nil {
		skipNotSupportedError(t, err)
		t.Fatal(err)
	}
	t.Logf("%s: %d trades the last minute", m.Symbol, len(trades))
}

func testFetchBalance(t *testing.T, x ccxt.Exchange) {
	b, err := x.FetchBalance(nil)
	if err != nil {
		skipAuthError(t, err)
		t.Fatal(err)
	}
	b.FilterZeros()
	t.Logf("balance totals: %v", b.Total)
}

func testOrdersBasics(t *testing.T, x ccxt.Exchange) {
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

	var market ccxt.Market
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
