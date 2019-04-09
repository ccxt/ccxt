package ccxt

import (
	"github.com/ccxt/ccxt/go/util"
)

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

	Info() ExchangeInfo
	LoadMarkets(reload bool) (map[string]Market, error)
	GetMarket(symbol string) (Market, error)
	CreateLimitBuyOrder(symbol string, amount float64, price *float64, params map[string]interface{}) (Order, error)
	CreateLimitSellOrder(symbol string, amount float64, price *float64, params map[string]interface{}) (Order, error)
	CreateMarketBuyOrder(symbol string, amount float64, params map[string]interface{}) (Order, error)
	CreateMarketSellOrder(symbol string, amount float64, params map[string]interface{}) (Order, error)
}

func LoadMarkets(x Exchange) (map[string]Market, error) {
	markets, err := x.FetchMarkets()
	if err != nil {
		return nil, err
	}
	mmap := make(map[string]Market, len(markets))
	for _, v := range markets {
		v.Exchange = x
		mmap[v.Symbol] = v
	}
	return mmap, nil
}
