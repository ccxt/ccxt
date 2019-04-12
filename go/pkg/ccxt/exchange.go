package ccxt

import (
	"encoding/json"
	"fmt"
	"net/url"
)

// Exchange is a common interface of methods
type Exchange interface {
	// FetchTickers(symbols []string, params map[string]interface{}) (map[string]Ticker, error)
	// FetchTicker(symbol string, params map[string]interface{}) (Ticker, error)
	// FetchOHLCV(symbol, tf string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]OHLCV, error)
	// FetchOrderBook(symbol string, limit *int, params map[string]interface{}) (OrderBook, error)
	// FetchL2OrderBook(symbol string, limit *int, params map[string]interface{}) (OrderBook, error)
	// FetchTrades(symbol string, since *util.JSONTime, params map[string]interface{}) ([]Trade, error)
	// FetchOrder(id string, symbol *string, params map[string]interface{}) (Order, error)
	// FetchOrders(symbol *string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]Order, error)
	// FetchOpenOrders(symbol *string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]Order, error)
	// FetchClosedOrders(symbol *string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]Order, error)
	// FetchMyTrades(symbol *string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]Trade, error)
	// FetchBalance(params map[string]interface{}) (Balances, error)
	FetchCurrencies() ([]Currency, error)
	FetchMarkets(params *url.Values) ([]Market, error)
	SetMarkets(markets []Market, currencies []Currency) []Market

	// CreateOrder(symbol, t, side string, amount float64, price *float64, params map[string]interface{}) (Order, error)
	// CancelOrder(id string, symbol *string, params map[string]interface{}) error

	GetInfo() ExchangeInfo
	GetMarkets() []Market
	GetCurrencies() []Currency
	// LoadMarkets(reload bool, params *url.Values) (map[string]Market, error)
	// GetMarket(symbol string) (Market, error)
	// CreateLimitBuyOrder(symbol string, amount float64, price *float64, params map[string]interface{}) (Order, error)
	// CreateLimitSellOrder(symbol string, amount float64, price *float64, params map[string]interface{}) (Order, error)
	// CreateMarketBuyOrder(symbol string, amount float64, params map[string]interface{}) (Order, error)
	// CreateMarketSellOrder(symbol string, amount float64, params map[string]interface{}) (Order, error)
}

// Exchanges returns the available exchanges
func Exchanges() []string {
	available := []string{"bitmex"}
	return available
}

// Info on the exchange
func Info(x Exchange) {
	var info interface{}
	info = x
	msg, err := json.MarshalIndent(info, "", "  ")
	if err != nil {
		fmt.Printf("Error JSONMarshal: %v", err)
	}
	fmt.Println(string(msg))
}

// LoadMarkets from the exchange that are active and available
func LoadMarkets(x Exchange, reload bool, params *url.Values) ([]Market, error) {
	if !reload && x.GetMarkets() != nil {
		return x.GetMarkets(), nil
	}
	var currencies []Currency
	var err error
	if x.GetInfo().Has.FetchCurrencies {
		currencies, err = x.FetchCurrencies()
		if err != nil {
			return nil, err
		}
	}
	markets, err := x.FetchMarkets(params)
	if err != nil {
		return nil, err
	}
	return x.SetMarkets(markets, currencies), nil
}
