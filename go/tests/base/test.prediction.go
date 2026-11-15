package base

// Hand-written (not generated): prediction-market live tests for the outcome-keyed methods.
//
// The generated test.fetch*.go files type-assert the exchange to the crypto per-method
// interfaces (ccxt.IFetchTicker → AsyncResult[Ticker], ...). Prediction cores implement the
// same method names with prediction result types (AsyncResult[PredictionTicker], ...), so that
// assertion panics with "missing method FetchTickerAsync". CallMethod routes prediction venues
// here instead; every result still goes through the shared structure validators
// (TestTicker/TestOrderBook/TestTrade/TestTradingFee already branch on has['prediction']).

import (
	ccxt "github.com/ccxt/ccxt/go/v4"
)

type iPredictionFetchTicker interface {
	FetchTickerAsync(outcome string, optionalArgs ...any) <-chan ccxt.AsyncResult[ccxt.PredictionTicker]
}
type iPredictionFetchTickers interface {
	FetchTickersAsync(optionalArgs ...any) <-chan ccxt.AsyncResult[map[string]ccxt.PredictionTicker]
}
type iPredictionFetchOrderBook interface {
	FetchOrderBookAsync(outcome string, optionalArgs ...any) <-chan ccxt.AsyncResult[ccxt.PredictionOrderBook]
}
type iPredictionFetchTrades interface {
	FetchTradesAsync(outcome any, optionalArgs ...any) <-chan ccxt.AsyncResult[[]ccxt.PredictionTrade]
}
type iPredictionFetchTradingFee interface {
	FetchTradingFeeAsync(outcome string, optionalArgs ...any) <-chan ccxt.AsyncResult[ccxt.PredictionTradingFee]
}

// PredictionFunctionsMap overrides FunctionsMap entries for has['prediction'] venues.
var PredictionFunctionsMap = map[string]any{
	"fetchTicker":     TestPredictionFetchTickerAsync,
	"fetchTickers":    TestPredictionFetchTickersAsync,
	"fetchOrderBook":  TestPredictionFetchOrderBookAsync,
	"fetchTrades":     TestPredictionFetchTradesAsync,
	"fetchTradingFee": TestPredictionFetchTradingFeeAsync,
}

func isPredictionExchange(exchange any) bool {
	core, ok := exchange.(ccxt.ICoreExchange)
	return ok && EvalTruthy(core.SafeBool(core.GetHas(), "prediction", false))
}

// predictionAs asserts the per-method prediction interface; a venue that advertises the method
// in `has` but lacks the typed method fails loudly (no skip).
func predictionAs[T any](exchange ccxt.ICoreExchange, method string) T {
	impl, ok := exchange.(T)
	if !ok {
		panic(ccxt.NotSupported(exchange.GetId() + " " + method + "() is advertised in has but the Go prediction class does not implement it"))
	}
	return impl
}

func predictionRun(body func()) <-chan ccxt.AsyncResult[any] {
	ch := make(chan ccxt.AsyncResult[any], 1)
	go func() {
		defer close(ch)
		defer ReturnPanicError(ch)
		body()
		ch <- ccxt.AsyncResult[any]{Value: true}
	}()
	return ch
}

func TestPredictionFetchTickerAsync(exchange ccxt.ICoreExchange, skippedProperties any, outcome any) <-chan ccxt.AsyncResult[any] {
	return predictionRun(func() {
		method := "fetchTicker"
		r := <-predictionAs[iPredictionFetchTicker](exchange, method).FetchTickerAsync(ToString(outcome))
		if r.Err != nil {
			panic(r.Err)
		}
		TestTicker(exchange, skippedProperties, method, DetypeForComparison(r.Value), outcome)
	})
}

func TestPredictionFetchTickersAsync(exchange ccxt.ICoreExchange, skippedProperties any, outcome any) <-chan ccxt.AsyncResult[any] {
	return predictionRun(func() {
		method := "fetchTickers"
		// prediction venues have no all-tickers endpoint: query by the outcome handle
		r := <-predictionAs[iPredictionFetchTickers](exchange, method).FetchTickersAsync([]string{ToString(outcome)})
		if r.Err != nil {
			panic(r.Err)
		}
		response := DetypeForComparison(r.Value)
		AssertDictionaryResponse(exchange, method, response, exchange.Json([]any{outcome}))
		values := ObjectValues(response)
		AssertNonEmtpyArray(exchange, skippedProperties, method, values, outcome)
		for i := 0; i < len(values); i++ {
			TestTicker(exchange, skippedProperties, method, values[i], nil)
		}
	})
}

func TestPredictionFetchOrderBookAsync(exchange ccxt.ICoreExchange, skippedProperties any, outcome any) <-chan ccxt.AsyncResult[any] {
	return predictionRun(func() {
		method := "fetchOrderBook"
		r := <-predictionAs[iPredictionFetchOrderBook](exchange, method).FetchOrderBookAsync(ToString(outcome))
		if r.Err != nil {
			panic(r.Err)
		}
		TestOrderBook(exchange, skippedProperties, method, DetypeForComparison(r.Value), outcome)
	})
}

func TestPredictionFetchTradesAsync(exchange ccxt.ICoreExchange, skippedProperties any, outcome any) <-chan ccxt.AsyncResult[any] {
	return predictionRun(func() {
		method := "fetchTrades"
		r := <-predictionAs[iPredictionFetchTrades](exchange, method).FetchTradesAsync(outcome)
		if r.Err != nil {
			panic(r.Err)
		}
		trades := DetypeForComparison(r.Value)
		AssertNonEmtpyArray(exchange, skippedProperties, method, trades)
		now := exchange.Milliseconds()
		for i := 0; i < GetArrayLength(trades); i++ {
			TestTrade(exchange, skippedProperties, method, GetValue(trades, i), outcome, now, true)
		}
		if !InOp(skippedProperties, "timestampSort") {
			AssertTimestampOrder(exchange, method, outcome, trades)
		}
	})
}

func TestPredictionFetchTradingFeeAsync(exchange ccxt.ICoreExchange, skippedProperties any, outcome any) <-chan ccxt.AsyncResult[any] {
	return predictionRun(func() {
		method := "fetchTradingFee"
		r := <-predictionAs[iPredictionFetchTradingFee](exchange, method).FetchTradingFeeAsync(ToString(outcome))
		if r.Err != nil {
			panic(r.Err)
		}
		fee := DetypeForComparison(r.Value)
		AssertDictionaryResponse(exchange, method, fee, outcome)
		TestTradingFee(exchange, skippedProperties, method, outcome, fee)
	})
}
