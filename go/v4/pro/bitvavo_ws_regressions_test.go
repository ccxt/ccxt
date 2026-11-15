package ccxtpro

import (
	"testing"
	"time"

	ccxt "github.com/ccxt/ccxt/go/v4"
)

// bitvavo handleTicker / handleBidAsk resolve a list under the multi-symbol hash; the
// watchPublicMultiple core must carry that list, not panic "resolved value is not map".
func TestBitvavoWatchTickersResolvesList(t *testing.T) {
	ex := NewBitvavo(map[string]any{})
	ex.SetMarkets([]any{map[string]any{
		"id": "BTC-EUR", "symbol": "BTC/EUR", "base": "BTC", "quote": "EUR", "baseId": "BTC", "quoteId": "EUR",
		"type": "spot", "spot": true, "active": true,
	}})
	url := "wss://ws.bitvavo.com/v2"
	client := ex.Client(url)
	client.StartedConnecting = true
	client.IsMock = true
	client.IsConnected = true
	client.Connected.(*ccxt.Future).Resolve(url)
	frame := map[string]any{"event": "ticker24h", "data": []any{map[string]any{
		"market": "BTC-EUR", "timestamp": int64(1786614374241), "last": "55198", "bid": "55198", "ask": "55199",
	}}}
	for _, watch := range []func() (ccxt.Tickers, error){
		func() (ccxt.Tickers, error) {
			return ex.WatchTickers(ccxt.WithWatchTickersSymbols([]string{"BTC/EUR"}))
		},
		func() (ccxt.Tickers, error) {
			return ex.WatchBidsAsks(ccxt.WithWatchBidsAsksSymbols([]string{"BTC/EUR"}))
		},
	} {
		type out struct {
			r   ccxt.Tickers
			err error
		}
		done := make(chan out, 1)
		go func() { r, err := watch(); done <- out{r, err} }()
		deadline := time.Now().Add(5 * time.Second)
		for client.PendingFutureCount() == 0 && time.Now().Before(deadline) {
			time.Sleep(time.Millisecond)
		}
		client.OnMessageCallback(client, frame)
		select {
		case o := <-done:
			if o.err != nil {
				t.Fatalf("watch failed: %v", o.err)
			}
			if _, ok := o.r.Tickers["BTC/EUR"]; !ok {
				t.Fatalf("BTC/EUR missing from %#v", o.r.Tickers)
			}
		case <-time.After(5 * time.Second):
			t.Fatal("watch did not resolve")
		}
	}
}
