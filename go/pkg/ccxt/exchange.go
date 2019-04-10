package ccxt

import (
	"encoding/json"
	"fmt"

	"github.com/ccxt/ccxt/go/internal/util"
)

// Exchange is a common interface of methods
type Exchange interface {
	FetchTickers(symbols []string, params map[string]interface{}) (map[string]Ticker, error)
	FetchTicker(symbol string, params map[string]interface{}) (Ticker, error)
	FetchOHLCV(symbol, tf string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]OHLCV, error)
	FetchOrderBook(symbol string, limit *int, params map[string]interface{}) (OrderBook, error)
	FetchL2OrderBook(symbol string, limit *int, params map[string]interface{}) (OrderBook, error)
	FetchTrades(symbol string, since *util.JSONTime, params map[string]interface{}) ([]Trade, error)
	FetchOrder(id string, symbol *string, params map[string]interface{}) (Order, error)
	FetchOrders(symbol *string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]Order, error)
	FetchOpenOrders(symbol *string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]Order, error)
	FetchClosedOrders(symbol *string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]Order, error)
	FetchMyTrades(symbol *string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]Trade, error)
	FetchBalance(params map[string]interface{}) (Balances, error)
	FetchCurrencies() ([]Currency, error)
	FetchMarkets() ([]Market, error)

	CreateOrder(symbol, t, side string, amount float64, price *float64, params map[string]interface{}) (Order, error)
	CancelOrder(id string, symbol *string, params map[string]interface{}) error

	// Info() (ExchangeInfo, error)
	LoadMarkets(reload bool) (map[string]Market, error)
	GetMarket(symbol string) (Market, error)
	CreateLimitBuyOrder(symbol string, amount float64, price *float64, params map[string]interface{}) (Order, error)
	CreateLimitSellOrder(symbol string, amount float64, price *float64, params map[string]interface{}) (Order, error)
	CreateMarketBuyOrder(symbol string, amount float64, params map[string]interface{}) (Order, error)
	CreateMarketSellOrder(symbol string, amount float64, params map[string]interface{}) (Order, error)
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

// LoadMarkets from exchange
// func LoadMarkets(x Exchange) (map[string]Market, error) {
// 	markets, err := x.FetchMarkets()
// 	if err != nil {
// 		return nil, err
// 	}
// 	mmap := make(map[string]Market, len(markets))
// 	for _, v := range markets {
// 		v.Exchange = &x
// 		mmap[v.Symbol] = v
// 	}
// 	return mmap, nil
// }

// func (x *Exchange) FetchTickers(symbols []string, params map[string]interface{}) (map[string]Ticker, error) {
// 	return nil, nil
// }

// func (x *Exchange) FetchTicker(symbol string, params map[string]interface{}) (Ticker, error) {
// 	ticker := Ticker{}
// 	return ticker, nil
// }
// func (x *Exchange) FetchOHLCV(symbol, tf string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]OHLCV, error) {
// 	return nil, nil
// }
// func (x *Exchange) FetchOrderBook(symbol string, limit *int, params map[string]interface{}) (OrderBook, error) {
// 	orderbook := OrderBook{}
// 	return orderbook, nil
// }
// func (x *Exchange) FetchL2OrderBook(symbol string, limit *int, params map[string]interface{}) (OrderBook, error) {
// 	orderbook := OrderBook{}
// 	return orderbook, nil
// }
// func (x *Exchange) FetchTrades(symbol string, since *util.JSONTime, params map[string]interface{}) ([]Trade, error) {
// 	return nil, nil
// }
// func (x *Exchange) FetchOrder(id string, symbol *string, params map[string]interface{}) (Order, error) {
// 	order := Order{}
// 	return order, nil
// }
// func (x *Exchange) FetchOrders(symbol *string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]Order, error) {
// 	return nil, nil
// }
// func (x *Exchange) FetchOpenOrders(symbol *string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]Order, error) {
// 	return nil, nil
// }
// func (x *Exchange) FetchClosedOrders(symbol *string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]Order, error) {
// 	return nil, nil
// }
// func (x *Exchange) FetchMyTrades(symbol *string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]Trade, error) {
// 	return nil, nil
// }
// func (x *Exchange) FetchBalance(params map[string]interface{}) (Balances, error) {
// 	balances := Balances{}
// 	return balances, nil
// }
// func (x *Exchange) FetchCurrencies() ([]Currency, error) {
// 	return nil, nil
// }
// func (x *Exchange) FetchMarkets() ([]Market, error) {
// 	return nil, nil
// }
// func (x *Exchange) CreateOrder(symbol, t, side string, amount float64, price *float64, params map[string]interface{}) (Order, error) {
// 	order := Order{}
// 	return order, nil
// }
// func (x *Exchange) CancelOrder(id string, symbol *string, params map[string]interface{}) error {
// 	return nil
// }

// func (x *Exchange) Info() ExchangeInfo {
// 	return ExchangeInfo{}
// }

// func (x *Exchange) GetMarket(symbol string) (Market, error) {
// 	market := Market{}
// 	return market, nil
// }
// func (x *Exchange) CreateLimitBuyOrder(symbol string, amount float64, price *float64, params map[string]interface{}) (Order, error) {
// 	order := Order{}
// 	return order, nil
// }
// func (x *Exchange) CreateLimitSellOrder(symbol string, amount float64, price *float64, params map[string]interface{}) (Order, error) {
// 	order := Order{}
// 	return order, nil
// }
// func (x *Exchange) CreateMarketBuyOrder(symbol string, amount float64, params map[string]interface{}) (Order, error) {
// 	order := Order{}
// 	return order, nil
// }
// func (x *Exchange) CreateMarketSellOrder(symbol string, amount float64, params map[string]interface{}) (Order, error) {
// 	order := Order{}
// 	return order, nil
// }
