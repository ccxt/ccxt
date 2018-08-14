package ccxt

import (
	"flag"
	"github.com/ccxt/ccxt/go/util"
	u "github.com/rkjdid/util"
	"log"
	"math"
	"strings"
	"testing"
	"time"
)

var (
	exchangeName = flag.String("testExchange", "bitfinex", "exchange to test")
	testREST     = flag.Bool("testREST", true, "test via ccxt-rest")
	testCfg      = flag.String("testCfg", "config.toml",
		"toml or json config file with api keys for exchanges (see config.go)")

	Config map[string]APIKey
	x      Exchange
	err    error
)

func init() {
	flag.Parse()

	if !*testREST {
		log.Fatal("only -testREST supported for now")
	}

	var key, sec string
	_ = u.ReadGenericFile(&Config, *testCfg)
	if cfg, ok := Config[*exchangeName]; ok {
		key = cfg.Key
		sec = cfg.Secret
	}

	x, err = NewExchangeREST(*exchangeName, *exchangeName, key, sec, nil)
	if err != nil {
		log.Fatalf("couldn't create exchange %s: %s", *exchangeName, err)
	}
	log.Println(*exchangeName)
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

func getAnyMarket(t *testing.T, x Exchange) (m Market) {
	markets, err := x.LoadMarkets(false)
	if err != nil {
		t.Fatal("LoadMarkets: ", err)
	}
	for _, v := range markets {
		// avoid weird instruments starting with "." on bitmex
		if *exchangeName == "bitmex" && strings.HasPrefix(v.Symbol, ".") {
			continue
		}
		return v
	}
	t.Fatalf("%s: no markets available", x.Info().Name)
	return
}

// TestListExchangeREST cannot fail, it tries to instanciate each available exchanges listed by
// ccxt and logs error for those who failed and the list of those who succeeded (needs go test -v)
// An error is always an unmarshalling error, it means the info we get from ccxt implementation
// of the exchange doesn't match expected type structure.
func TestListExchangesREST(t *testing.T) {
	exchanges, err := ListExchangesREST(nil)
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("%d available exchanges\n", len(exchanges))

	var ok []string
	for _, v := range exchanges {
		// init each exchange
		_, err := NewExchangeREST(v, "test"+v, "", "", nil)
		if err != nil {
			t.Logf("couldnt create %s: %s", v, err)
		} else {
			ok = append(ok, v)
		}
	}
	t.Logf("successfully created %d/%d exchange instances", len(ok), len(exchanges))
	t.Logf("\t%v", ok)
}

func TestExchangeREST_LoadMarkets(t *testing.T) {
	markets, err := x.LoadMarkets(false)
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("%d markets available\n", len(markets))
}

func TestExchangeREST_FetchOpenOrders(t *testing.T) {
	m := getAnyMarket(t, x)
	openOrders, err := x.FetchOpenOrders(&m.Symbol, nil, nil, nil)
	if err != nil {
		skipAuthError(t, err)
		skipNotSupportedError(t, err)
		t.Fatal(err)
	}
	t.Logf("%s: %d open orders\n", m.Symbol, len(openOrders))
}

func TestExchangeREST_FetchClosedOrders(t *testing.T) {
	m := getAnyMarket(t, x)
	orders, err := x.FetchClosedOrders(&m.Symbol, nil, nil, nil)
	if err != nil {
		skipAuthError(t, err)
		skipNotSupportedError(t, err)
		t.Fatal(err)
	}
	t.Logf("%s: %d closed orders", m.Symbol, len(orders))
}

func TestExchangeREST_FetchOrders(t *testing.T) {
	m := getAnyMarket(t, x)
	orders, err := x.FetchOrders(&m.Symbol, nil, nil, nil)
	if err != nil {
		skipAuthError(t, err)
		skipNotSupportedError(t, err)
		t.Fatal(err)
	}
	t.Logf("%s: %d orders", m.Symbol, len(orders))
}

func TestExchangeREST_FetchTickers(t *testing.T) {
	tickers, err := x.FetchTickers(nil, nil)
	if err != nil {
		skipNotSupportedError(t, err)
		t.Fatal(err)
	}
	t.Logf("%d tickers\n", len(tickers))
}

func TestExchangeREST_FetchTicker(t *testing.T) {
	m := getAnyMarket(t, x)
	ticker, err := x.FetchTicker(m.Symbol, nil)
	if err != nil {
		skipNotSupportedError(t, err)
		t.Fatal(err)
	}
	t.Logf("%s (%.2f%%): %f / %f\n", ticker.Symbol, ticker.Change, ticker.Ask, ticker.Bid)
}

func TestExchangeREST_FetchOHLCV(t *testing.T) {
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

func TestExchangeREST_FetchOrderBook(t *testing.T) {
	m := getAnyMarket(t, x)
	book, err := x.FetchOrderBook(m.Symbol, nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("%s: %d asks / %d bids\n", m.Symbol, len(book.Asks), len(book.Bids))
}

func TestExchangeREST_FetchTrades(t *testing.T) {
	m := getAnyMarket(t, x)
	trades, err := x.FetchTrades(m.Symbol, util.Time(time.Now().Add(-time.Minute)), nil)
	if err != nil {
		skipNotSupportedError(t, err)
		t.Fatal(err)
	}
	t.Logf("%s: %d trades the last minute", m.Symbol, len(trades))
}

func TestExchangeREST_FetchBalance(t *testing.T) {
	b, err := x.FetchBalance(nil)
	if err != nil {
		skipAuthError(t, err)
		t.Fatal(err)
	}
	b.FilterZeros()
	t.Logf("balance totals: %v", b.Total)
}

func TestExchangeREST_OrdersBasics(t *testing.T) {
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
		// avoid weird instruments starting with "." on bitmex
		if *exchangeName == "bitmex" && strings.HasPrefix(v.Symbol, ".") {
			continue
		}
		if free = balances.Free[v.Base]; free > 0 {
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
		t.Fatalf("couldn't fetch order book for %s:%s: %s",
			*exchangeName, market.Symbol, err)
	}
	if len(book.Asks) == 0 {
		t.Fatalf("empty book.Asks")
	}

	// setup order for 10% of available balance @10*highest ask
	ask := book.Asks[len(book.Asks)-1].Price * 10
	amount := free * 0.1

	// mex contracts are pegged to USD
	if *exchangeName == "bitmex" {
		amount = math.Floor(amount * book.Asks[0].Price)
	}

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
